#!/usr/bin/env node
/**
 * skill-workbench scorer — 0–100 per-metric scores for a single skill.
 * Zero dependencies. Node >= 18. Deterministic: same input → same scores.
 *
 * Usage:
 *   node score.js <path-to-skill-folder-or-SKILL.md> [--json]
 *
 * Metrics (mirrored in SKILL.md, single-skill mode Step A):
 *   spec-compliance    agentskills.io frontmatter + structural rules (fail-impaired)
 *   file-integrity     relative references + phantom skill refs resolve
 *   eval-readiness     evals/evals.json exists and is well-formed
 *   size-discipline    SKILL.md body size vs the 500-line progressive-disclosure budget
 *   self-containment   auxiliary folders (scripts/references/docs) actually present
 *
 * Scoring policy (weights sum to 100):
 *   spec-compliance 40 · file-integrity 25 · eval-readiness 20 ·
 *   size-discipline 10 · self-containment 5
 * Each metric = 100 × (earned weight / total weight). Overall = weighted mean.
 *
 * Exit codes: 0 = scores produced, 2 = usage error.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { validateSkill, parseFrontmatter, DEFAULT_SKILLS_ROOT } = require('./validate-lib.js');

const WEIGHTS = {
  'spec-compliance': 40,
  'file-integrity': 25,
  'eval-readiness': 20,
  'size-discipline': 10,
  'self-containment': 5,
};

/** Fail-impaired checks: each fail cuts the metric score proportionally. */
const SPEC_CHECKS = ['fm-present', 'fm-name-valid', 'fm-name-matches', 'fm-desc-nonempty', 'fm-compat-len'];
const INTEGRITY_CHECKS = ['file-refs', 'phantom-skill-refs'];

function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 100; }

function evalReadiness(skillDir) {
  const p = path.join(skillDir, 'evals', 'evals.json');
  if (!fs.existsSync(p)) return { score: 0, note: 'no evals/evals.json' };
  let raw;
  try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) {
    return { score: 40, note: `evals.json unparseable: ${e.message}` };
  }
  const cases = Array.isArray(raw) ? raw : Array.isArray(raw.cases) ? raw.cases : Array.isArray(raw.evals) ? raw.evals : null;
  if (!cases || !cases.length) return { score: 50, note: 'evals.json has no cases' };
  const withPrompt = cases.filter((c) => c && (typeof c.prompt === 'string' ? c.prompt.trim() : (c.input && typeof c.input.prompt === 'string')));
  const ratio = withPrompt.length / cases.length;
  return { score: Math.round(50 + 50 * ratio), note: `${cases.length} case(s), ${withPrompt.length} with prompt` };
}

function sizeDiscipline(skillDir) {
  const fmPath = path.join(skillDir, 'SKILL.md');
  const text = fs.readFileSync(fmPath, 'utf8');
  const { body } = parseFrontmatter(text);
  const lines = body.split(/\r?\n/).length;
  // 250 lines = full marks; degrade linearly to 0 at 600.
  const score = lines <= 250 ? 100 : Math.max(0, Math.round(100 * (600 - lines) / (600 - 250)));
  return { score, lines };
}

function selfContainment(skillDir) {
  const dirs = ['scripts', 'references', 'assets', 'docs', 'evals'];
  const present = dirs.filter((d) => fs.existsSync(path.join(skillDir, d)));
  const referenced = dirs.filter((d) => present.includes(d) && d !== 'evals');
  // Full marks need 5 raw points: `references` alone is 2, so the common
  // references+evals shape scores 3/5 = 60. Add `scripts` (worth 2) to reach 5.
  const strong = (present.includes('scripts') ? 2 : 0) + (present.includes('references') ? 2 : 0);
  const weak = present.filter((d) => !['scripts', 'references'].includes(d)).length;
  const raw = Math.min(5, strong + weak); // out of 5
  return { score: pct(raw, 5), present };
}

function scoreSkill(skillDir, opts) {
  opts = opts || {};
  const skillsRoot = opts.skillsRoot || DEFAULT_SKILLS_ROOT;
  const r = validateSkill(skillDir, { skillsRoot });

  const fails = (checks) => r.findings.filter((f) => f.severity === 'fail' && checks.includes(f.check));
  const specFail = fails(SPEC_CHECKS);
  const integFail = fails(INTEGRITY_CHECKS);
  const bodyWarn = r.findings.find((f) => f.check === 'body-length' && f.severity !== 'pass');

  const specCompliance = pct(SPEC_CHECKS.length - specFail.length, SPEC_CHECKS.length);
  const fileIntegrity = pct(INTEGRITY_CHECKS.length - integFail.length, INTEGRITY_CHECKS.length);
  const evalR = evalReadiness(skillDir);
  const size = sizeDiscipline(skillDir);
  const selfC = selfContainment(skillDir);

  const scores = {
    'spec-compliance': specCompliance,
    'file-integrity': fileIntegrity,
    'eval-readiness': evalR.score,
    'size-discipline': size.score,
    'self-containment': selfC.score,
  };

  let total = 0, maxTotal = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) { total += (scores[k] / 100) * w; maxTotal += w; }
  const overall = Math.round(total);

  const verdict = overall >= 90 ? 'excellent' : overall >= 75 ? 'good' : overall >= 50 ? 'needs-work' : 'poor';

  return {
    skill: r.skill,
    dir: skillDir,
    overall,
    verdict,
    scores,
    weights: WEIGHTS,
    details: {
      spec_fails: specFail.map((f) => f.check),
      integrity_fails: integFail.map((f) => f.check),
      evals: evalR.note,
      body_lines: size.lines,
      aux_folders: selfC.present,
      body_warning: bodyWarn ? bodyWarn.detail : null,
      validation_fails: r.findings.filter((f) => f.severity === 'fail').length,
      validation_warns: r.findings.filter((f) => f.severity === 'warn').length,
    },
  };
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const args = argv.filter((a) => a !== '--json');

  if (!args[0]) {
    console.error('usage: score.js <skill-folder|SKILL.md> [--json]');
    process.exitCode = 2;
    return;
  }

  let p = path.resolve(args[0]);
  if (fs.existsSync(p) && fs.statSync(p).isFile() && path.basename(p) === 'SKILL.md') p = path.dirname(p);
  if (!fs.existsSync(path.join(p, 'SKILL.md'))) {
    console.error(`Not a skill folder (no SKILL.md): ${p}`);
    process.exitCode = 2;
    return;
  }

  const result = scoreSkill(p, { skillsRoot: path.dirname(p) });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n== ${result.skill} ==  overall ${result.overall}/100 (${result.verdict})\n`);
    const bar = (s) => '█'.repeat(Math.round(s / 10)).padEnd(10, '░');
    for (const [k, w] of Object.entries(WEIGHTS)) {
      console.log(`  ${bar(result.scores[k])} ${result.scores[k].toString().padStart(3)}/100  (weight ${w})  ${k}`);
    }
    const d = result.details;
    if (d.spec_fails.length) console.log(`  spec fails: ${d.spec_fails.join(', ')}`);
    if (d.integrity_fails.length) console.log(`  integrity fails: ${d.integrity_fails.join(', ')}`);
    console.log(`  evals: ${d.evals}`);
    console.log(`  body: ${d.body_lines} lines${d.body_warning ? ' (over budget)' : ''}`);
    console.log(`  aux folders: ${d.aux_folders.length ? d.aux_folders.join(', ') : 'none'}`);
  }
  process.exitCode = 0;
}

main();
