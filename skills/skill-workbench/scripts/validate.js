#!/usr/bin/env node
/**
 * skill-workbench validator — agentskills.io Specification checks.
 * Zero dependencies. Node >= 18.
 *
 * Usage:
 *   node validate.js <path-to-skill-folder-or-SKILL.md>   # validate one skill
 *   node validate.js --all [skills-root]                  # validate every skill in a root
 *   node validate.js <...> --json                         # machine-readable output
 *
 * Exit codes: 0 = no `fail` findings; 1 = at least one `fail`; 2 = usage error.
 *
 * Checks (stable ids, mirrored in references/spec-checklist.md):
 *   fm-present          SKILL.md exists with YAML frontmatter
 *   fm-name-valid       name: 1-64 chars, [a-z0-9-], no lead/trail/double hyphen
 *   fm-name-matches     name matches parent directory name
 *   fm-desc-nonempty    description: 1-1024 chars, non-empty, not a placeholder
 *   fm-compat-len       compatibility: <= 500 chars when present
 *   body-length         body <= 500 lines (spec progressive-disclosure guidance)
 *   file-refs           relative file references from SKILL.md resolve
 *   phantom-skill-refs  backticked kebab-case skill names resolve to real folders
 *
 * Docs mode (the same phantom rule applied to documentation, where a name that
 * resolves in agents/ counts as a persona, not a missing skill):
 *   node validate.js --docs [docs-root]                              # default ~/.agents/docs
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { validateSkill, validateDocs, DEFAULT_SKILLS_ROOT } = require('./validate-lib.js');

const DEFAULT_DOCS_ROOT = path.join(path.dirname(DEFAULT_SKILLS_ROOT), 'docs');

/**
 * Every canonical skill folder under root, plus the link-type entries (junctions /
 * symlinks) it skips. A skill whose real home is elsewhere is linked in rather than
 * copied, so it is deliberately out of validation scope — but the skip must never be
 * silent: Node's Dirent.isDirectory() is false for a reparse point, which used to
 * drop such an entry with no trace in the output.
 */
function findAllSkills(root) {
  if (!fs.existsSync(root)) return { targets: [], skippedLinks: [] };
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const skippedLinks = entries
    .filter((d) => !d.isDirectory() && fs.existsSync(path.join(root, d.name, 'SKILL.md')))
    .map((d) => d.name);
  const targets = entries
    .filter((d) => d.isDirectory())
    .map((d) => path.join(root, d.name))
    .filter((p) => fs.existsSync(path.join(p, 'SKILL.md')));
  return { targets, skippedLinks };
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const args = argv.filter((a) => a !== '--json');

  let targets = [];
  let skippedLinks = [];
  let opts = { skillsRoot: DEFAULT_SKILLS_ROOT };

  if (args[0] === '--docs') {
    const root = path.resolve(args[1] || DEFAULT_DOCS_ROOT);
    const r = validateDocs(root, { skillsRoot: opts.skillsRoot });
    const fails = r.findings.filter((f) => f.severity === 'fail');
    const warns = r.findings.filter((f) => f.severity === 'warn');
    if (json) {
      console.log(JSON.stringify(r, null, 2));
    } else {
      console.log(`\n== docs (${r.files} file(s)) ==`);
      for (const f of r.findings) console.log(`  [${f.severity.toUpperCase()}] ${f.check}: ${f.detail}`);
      console.log(fails.length ? `  → ${fails.length} fail, ${warns.length} warn` : `  → clean (${warns.length} warn)`);
    }
    process.exitCode = fails.length > 0 ? 1 : 0;
    return;
  }

  if (args[0] === '--all') {
    const root = path.resolve(args[1] || DEFAULT_SKILLS_ROOT);
    opts.skillsRoot = root;
    ({ targets, skippedLinks } = findAllSkills(root));
    if (!targets.length) {
      console.error(`No skills with SKILL.md found under ${root}`);
      process.exitCode = 2;
      return;
    }
  } else if (args[0]) {
    let p = path.resolve(args[0]);
    if (fs.existsSync(p) && fs.statSync(p).isFile() && path.basename(p) === 'SKILL.md') p = path.dirname(p);
    if (!fs.existsSync(path.join(p, 'SKILL.md'))) {
      console.error(`Not a skill folder (no SKILL.md): ${p}`);
      process.exitCode = 2;
      return;
    }
    opts.skillsRoot = path.dirname(p);
    targets = [p];
  } else {
    console.error('usage: validate.js <skill-folder|SKILL.md> [--json] | validate.js --all [skills-root] [--json] | validate.js --docs [docs-root] [--json]');
    process.exitCode = 2;
    return;
  }

  const results = targets.map((t) => validateSkill(t, opts));
  const failCount = results.reduce((s, r) => s + r.findings.filter((f) => f.severity === 'fail').length, 0);
  const warnCount = results.reduce((s, r) => s + r.findings.filter((f) => f.severity === 'warn').length, 0);

  if (json) {
    console.log(JSON.stringify({ skills_root: opts.skillsRoot, validated: results.length, fail_count: failCount, warn_count: warnCount, skipped_links: skippedLinks, results }, null, 2));
  } else {
    for (const r of results) {
      const fails = r.findings.filter((f) => f.severity === 'fail');
      const warns = r.findings.filter((f) => f.severity === 'warn');
      console.log(`\n== ${r.skill} ==`);
      for (const f of r.findings) console.log(`  [${f.severity.toUpperCase()}] ${f.check}: ${f.detail}`);
      console.log(fails.length ? `  → ${fails.length} fail, ${warns.length} warn` : `  → clean (${warns.length} warn)`);
    }
    if (skippedLinks.length) {
      console.log(`\nSkipped ${skippedLinks.length} link entry(ies) — real folder lives elsewhere, out of validation scope: ${skippedLinks.join(', ')}`);
    }
    console.log(`\nValidated ${results.length} skill(s): ${failCount} fail, ${warnCount} warn`);
  }
  process.exitCode = failCount > 0 ? 1 : 0;
}

main();
