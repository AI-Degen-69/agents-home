#!/usr/bin/env node
/**
 * pipeline-closure.js — which skills does the issue-to-PR pipeline actually need?
 *
 * Walks the 10 station skills (pipeline-triage, i-*, create-issue, ii-* … present-pr)
 * and follows every skill reference transitively. A reference is a BACKTICKED token
 * that names a real skill folder — the same convention validate-lib.js
 * phantomSkillRefs uses, inverted. Matching by name rather than by kebab shape is
 * deliberate: it keeps single-word skills (`humanizer`) and ignores prose that
 * happens to match a skill name (`explore`, `performance`).
 *
 * evals/snapshots and evals/iteration-* are skipped: they hold past versions, and
 * reading them invents dependencies the pipeline does not have today.
 *
 * Zero dependencies. Node >= 18.
 *   node pipeline-closure.js          human-readable list with reference sites
 *   node pipeline-closure.js --json   {"skills":[...],"stations":[...],"helpers":[...]}
 *   node pipeline-closure.js --verify --project <path>   compare a project copy
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');          // ~/.agents
const SKILLS = process.env.AGENTS_SKILLS_ROOT || path.join(ROOT, 'skills');

const STATIONS = [
  'pipeline-triage', 'i-pick-issue', 'create-issue', 'ii-plan-issue',
  'iii-build-plan', 'iiib-iterate-after-build', 'iv-review-build-and-pr',
  'v-babysit-pr-and-merge', 'vi-close-pipeline', 'present-pr',
];

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const verify = args.includes('--verify');
const checkListMode = args.includes('--check-list');
const projectArg = args.indexOf('--project');

const all = new Set(
  fs.readdirSync(SKILLS).filter((d) => fs.existsSync(path.join(SKILLS, d, 'SKILL.md')))
);

const SKIP_DIR = /(^|[\\/])(snapshots|iteration-\d+|node_modules|\.git)([\\/]|$)/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP_DIR.test(p)) continue;
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function closure() {
  const ref = /`([^`\s]+)`/g;
  const found = new Map();                       // name -> first reference site
  const queue = STATIONS.filter((s) => all.has(s));
  for (const s of queue) found.set(s, 'STATION');
  while (queue.length) {
    const cur = queue.shift();
    const dir = path.join(SKILLS, cur);
    if (!fs.existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(ref)) {
        const dep = m[1];
        if (dep === cur || !all.has(dep) || found.has(dep)) continue;
        found.set(dep, `${cur} <- ${path.relative(SKILLS, file)}`);
        queue.push(dep);
      }
    }
  }
  return found;
}

function sha(file) {
  return require('crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** Hash of the meaningful content of a skill folder (SKILL.md + references + scripts). */
function folderHash(dir) {
  const files = walk(dir).sort();
  const h = require('crypto').createHash('sha256');
  for (const f of files) {
    h.update(path.relative(dir, f).replace(/\\/g, '/'));
    h.update(sha(f));
  }
  return h.digest('hex');
}

/**
 * What the project's own mirror machinery cannot check.
 *
 * verify-mirror.js and sync-from-canonical.js both hard-code the same 46-skill
 * list, and they guard against *each other* drifting. Neither compares that list
 * to the actual skill graph: a station can start referencing a new helper and
 * both lists stay happily agreed on the old set. That is a real gap - it is how
 * `verification-before-completion` came to be listed as a Station IIIB dependency
 * in the workflow doc while no live file in iiib-iterate-after-build named it.
 *
 * This compares the computed closure against the project's list. Run it in CI
 * alongside `npm run validate:mirror`.
 */
function checkList(project) {
  const f = path.join(project, 'scripts', 'verify-mirror.js');
  if (!fs.existsSync(f)) { console.error(`no verify-mirror.js under ${project}`); process.exit(2); }
  const src = fs.readFileSync(f, 'utf8');
  const block = src.match(/EXPECTED_SKILLS\s*=\s*\[([\s\S]*?)\n\];/);
  if (!block) { console.error('could not find EXPECTED_SKILLS in verify-mirror.js'); process.exit(2); }
  const declared = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();

  const onlyDeclared = declared.filter((s) => !skills.includes(s));
  const onlyClosure = skills.filter((s) => !declared.includes(s));
  console.log(`declared: ${declared.length}  closure: ${skills.length}`);
  if (onlyDeclared.length) {
    console.error(`declared but nothing in the pipeline references them:\n  ${onlyDeclared.join('\n  ')}`);
    console.error('  either a reference was deleted, or the doc claims a dependency the skill does not declare');
  }
  if (onlyClosure.length) {
    console.error(`referenced by the pipeline but not declared (will never be mirrored):\n  ${onlyClosure.join('\n  ')}`);
    console.error(`  add to EXPECTED_SKILLS in verify-mirror.js and STATIONS in sync-from-canonical.js`);
  }
  if (onlyDeclared.length || onlyClosure.length) process.exit(1);
  console.log('the hand-maintained list matches the computed closure');
}

const found = closure();
const stations = STATIONS.filter((s) => all.has(s));
const helpers = [...found.keys()].filter((k) => !STATIONS.includes(k)).sort();
const skills = [...found.keys()].sort();

if (checkListMode) {
  const project = projectArg > -1 ? args[projectArg + 1] : null;
  if (!project) { console.error('usage: --check-list --project <path>'); process.exit(2); }
  checkList(project);
  process.exit(0);
}

if (verify) {
  const project = projectArg > -1 ? args[projectArg + 1] : null;
  if (!project) { console.error('usage: --verify --project <path>'); process.exit(2); }
  const target = path.join(project, 'skills');
  const rows = skills.map((name) => {
    const dest = path.join(target, name);
    if (!fs.existsSync(dest)) return { name, state: 'MISSING' };
    const st = fs.lstatSync(dest);
    if (st.isSymbolicLink()) {
      const real = fs.realpathSync(dest);
      return { name, state: real === fs.realpathSync(path.join(SKILLS, name)) ? 'LINK-OK' : 'LINK-WRONG' };
    }
    return { name, state: folderHash(dest) === folderHash(path.join(SKILLS, name)) ? 'COPY-IN-SYNC' : 'COPY-DRIFTED' };
  });
  const extras = fs.readdirSync(target).filter((n) => !skills.includes(n) && fs.statSync(path.join(target, n)).isDirectory());
  console.log(JSON.stringify({ project: target, closure: skills.length, rows, extras }, null, 2));
  process.exit(rows.some((r) => r.state !== 'LINK-OK' && r.state !== 'COPY-IN-SYNC') ? 1 : 0);
}

if (asJson) {
  console.log(JSON.stringify({ skills, stations, helpers, reference_sites: Object.fromEntries(found) }, null, 2));
} else {
  console.log(`stations: ${stations.length}`);
  console.log(`helpers:  ${helpers.length}`);
  for (const h of helpers) console.log(`  ${h}   ${found.get(h)}`);
  console.log(`\nTOTAL: ${skills.length}`);
  console.log(skills.join('\n'));
}
