#!/usr/bin/env node
/**
 * Deterministic grader for the ii-plan-issue refinement loop.
 * Zero dependencies. Node >= 18.
 *
 * Subcommands:
 *   audit  --skill <SKILL.md>                 → mechanical 1g audit (missing skill refs, length, sections)
 *   case   --evals <evals.json> --skill <SKILL.md> [--id <case-id>] --out <results.json>
 *
 * Static assertions are checked against the skill spec itself (structure/contract checks).
 * Live assertions (need a real repo + gh) are reported as not-run and excluded from pass rates.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// Skills root: override via SKILLS_ROOT env var; else resolve relative to this script
// (skills/<name>/scripts/grade.js → walk up to the skills/ root).
const GLOBAL_SKILLS_DIR = process.env.SKILLS_ROOT ||
  path.resolve(__dirname, '..', '..');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function kebabCandidates(text) {
  // Backticked tokens that look like skill names (kebab/snake case, no slash, no dot).
  const tokens = new Set();
  const re = /`([a-z][a-z0-9]*(?:[_-][a-z0-9]+)+)`/g;
  let m;
  while ((m = re.exec(text)) !== null) tokens.add(m[1]);
  return [...tokens];
}

function audit(skillPath) {
  const text = read(skillPath);
  const lines = text.split(/\r?\n/);
  const findings = [];
  const add = (severity, check, detail) => findings.push({ severity, check, detail });

  // 1) Phantom skill references: backticked kebab/snake tokens with no folder on disk.
  const candidates = kebabCandidates(text);
  const missing = candidates.filter((t) => {
    const p = path.join(GLOBAL_SKILLS_DIR, t);
    return !(fs.existsSync(p) && fs.statSync(p).isDirectory());
  });
  if (missing.length) {
    add('fail', 'phantom-skill-refs',
      `Referenced skills with no folder in ${GLOBAL_SKILLS_DIR}: ${missing.join(', ')}`);
  } else {
    add('pass', 'phantom-skill-refs', 'All kebab/snake-case backticked skill references resolve to real skill folders');
  }

  // 2) SKILL.md length (Red Hat: < ~500 lines; also flag >150 for an entry point).
  if (lines.length >= 500) add('fail', 'skill-length', `${lines.length} lines (>=500)`);
  else if (lines.length > 150) add('warn', 'skill-length', `${lines.length} lines — consider splitting optional content into on-demand files`);
  else add('pass', 'skill-length', `${lines.length} lines`);

  // 3) L1 description specificity: must name trigger context + output, not be generic.
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const desc = fm ? (fm[1].match(/description:\s*(.+)/) || [])[1] || '' : '';
  const specificity = /(Station|issue|plan|GitHub|tasks\/plan\.md)/i.test(desc) && desc.length > 80;
  add(specificity ? 'pass' : 'fail', 'l1-description',
    specificity ? 'Description names trigger context and outputs' : `Description too generic or short: "${desc.slice(0, 120)}"`);

  // 4) Structured sections (Anthropic: distinct sections).
  const sections = (text.match(/^#{1,3} /gm) || []).length;
  add(sections >= 4 ? 'pass' : 'warn', 'structured-sections', `${sections} markdown sections`);

  // 5) Hybrid architecture: mechanical work delegated to scripts?
  const hasScripts = fs.existsSync(path.join(path.dirname(skillPath), 'scripts')) ||
    /scripts\//.test(text);
  add(hasScripts ? 'pass' : 'warn', 'hybrid-architecture',
    hasScripts ? 'scripts/ folder or script delegation present' : 'No scripts/ — all logic is prose (candidates: gh guards, artifact checks)');

  // 6) Canonical examples present?
  add(/```/.test(text) || /example/i.test(text) ? 'pass' : 'warn', 'canonical-examples',
    /```/.test(text) ? 'Has a fenced example (report template)' : 'No canonical example');

  return { skill: skillPath, lines: lines.length, findings };
}

function extractTemplate(text) {
  // The Hebrew report template = first fenced ```markdown block.
  const m = text.match(/```markdown\r?\n([\s\S]*?)\r?\n```/);
  if (!m) return null;
  return m[1];
}

function templateLines(tpl) {
  if (!tpl) return -1;
  return tpl.split(/\r?\n/).filter((l) => {
    const s = l.trim();
    return s !== '' && s !== '---' && s !== '```';
  }).length;
}

function gradeCase(evalCase, text, tpl) {
  const results = [];
  for (const a of evalCase.static_assertions || []) {
    let pass = false;
    let detail = '';
    if (a.type === 'regex') {
      // Prose checks are case-insensitive and tolerant of markdown punctuation.
      pass = new RegExp(a.pattern, 'im').test(text);
      detail = pass ? `matched /${a.pattern}/i` : `did NOT match /${a.pattern}/i`;
    } else if (a.type === 'not_regex') {
      const hit = new RegExp(a.pattern, 'i').test(text);
      pass = !hit;
      detail = hit ? `forbidden pattern /${a.pattern}/ present` : `forbidden pattern absent`;
    } else if (a.type === 'max_template_lines') {      const n = templateLines(tpl);
      pass = n >= 0 && n <= a.limit;
      detail = `template has ${n} non-empty lines (limit ${a.limit})`;
    } else {
      pass = false;
      detail = `unknown assertion type ${a.type}`;
    }
    results.push({ id: a.id, type: a.type, pass, detail, why: a.why });
  }
  const live = (evalCase.live_assertions || []).map((l) => ({ assertion: l, status: 'not-run', reason: 'requires live repo + gh run' }));
  const passed = results.filter((r) => r.pass).length;
  return {
    case_id: evalCase.id,
    static: { total: results.length, passed, failed: results.length - passed, results },
    live,
    pass_rate: results.length ? passed / results.length : 0,
  };
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const arg = (name) => {
    const i = argv.indexOf('--' + name);
    return i >= 0 ? argv[i + 1] : undefined;
  };

  if (cmd === 'audit') {
    const out = audit(arg('skill'));
    console.log(JSON.stringify(out, null, 2));
    process.exitCode = 0; // audit is informational; grading happens in `case`
    return;
  }

  if (cmd === 'case') {
    const evals = JSON.parse(read(arg('evals')));
    const text = read(arg('skill'));
    const tpl = extractTemplate(text);
    const wanted = arg('id');
    const cases = evals.evals.filter((e) => !wanted || e.id === wanted);
    const graded = cases.map((c) => gradeCase(c, text, tpl));
    const totalStatic = graded.reduce((s, g) => s + g.static.total, 0);
    const totalPassed = graded.reduce((s, g) => s + g.static.passed, 0);
    const summary = {
      skill: arg('skill'),
      graded_at: new Date().toISOString(),
      cases: graded.length,
      static_assertions: totalStatic,
      static_passed: totalPassed,
      static_failed: totalStatic - totalPassed,
      static_pass_rate: totalStatic ? +(totalPassed / totalStatic).toFixed(3) : 0,
      live_assertions: 'excluded from rate (not-run)',
    };
    const outPath = arg('out');
    const payload = { summary, graded };
    if (outPath) fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    console.log(JSON.stringify(summary, null, 2));
    process.exitCode = totalStatic - totalPassed > 0 ? 1 : 0;
    return;
  }

  console.error('usage: grade.js audit --skill <SKILL.md> | case --evals <evals.json> --skill <SKILL.md> [--id x] [--out f.json]');
  process.exitCode = 2;
}

main();
