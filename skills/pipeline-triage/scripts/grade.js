#!/usr/bin/env node
/**
 * Deterministic grader for the pipeline-triage refinement loop.
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
// Agent personas are a separate tree: skills/<name>/scripts/ → <home>/agents/.
// A backticked `tdd-guide` is a real reference when agents/tdd-guide.md exists.
const AGENTS_DIR = path.resolve(GLOBAL_SKILLS_DIR, '..', 'agents');

// Narrow, enumerated list — NOT a blanket shape rule. Each entry is a token that
// is genuinely not a skill or persona reference. Anything not listed here must
// still resolve, so a genuine typo keeps failing. `pr-test-analyzer` is an
// external ECC provenance citation ("Absorbed from ECC ..."), not a local ref —
// the workbench allowlist carries it at validate-lib.js `NON_SKILL_TOKENS`.
const NON_SKILL_TOKENS = new Set([
  'html_url', 'step-play', 'hero-demo', 'pr-test-analyzer',
  // Label and API field names, not skill references.
  'needs-answers', 'needs-triage', 'ready-for-agent', 'blocked-by', 'start_line',
]);

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

/** A token resolves when it is a real skill folder, a real agent persona file,
 *  the skill's own file basenames, or an enumerated non-skill token. */
function resolves(token, skillPath) {
  if (NON_SKILL_TOKENS.has(token)) return true;
  const p = path.join(GLOBAL_SKILLS_DIR, token);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return true;
  if (fs.existsSync(path.join(AGENTS_DIR, `${token}.md`))) return true;
  const own = path.dirname(skillPath);
  for (const sub of ['', 'references', 'scripts', 'assets', 'evals', 'docs']) {
    if (fs.existsSync(path.join(own, sub, `${token}.md`))) return true;
    if (fs.existsSync(path.join(own, sub, token))) return true;
  }
  return false;
}

function audit(skillPath) {
  const text = read(skillPath);
  const lines = text.split(/\r?\n/);
  const findings = [];
  const add = (severity, check, detail) => findings.push({ severity, check, detail });

  // 1) Phantom skill references: backticked kebab/snake tokens that resolve to
  //    neither a skill folder, an agent persona, nor the skill's own files.
  const candidates = kebabCandidates(text);
  const missing = candidates.filter((t) => !resolves(t, skillPath));
  if (missing.length) {
    add('fail', 'phantom-skill-refs',
      `Referenced skills with no folder in ${GLOBAL_SKILLS_DIR} and no persona in ${AGENTS_DIR}: ${missing.join(', ')}`);
  } else {
    add('pass', 'phantom-skill-refs', 'All kebab/snake-case backticked skill references resolve to real skill folders or agent personas');
  }

  // 2) SKILL.md length (Red Hat: < ~500 lines; also flag >150 for an entry point).
  if (lines.length >= 500) add('fail', 'skill-length', `${lines.length} lines (>=500)`);
  else if (lines.length > 150) add('warn', 'skill-length', `${lines.length} lines — consider splitting optional content into on-demand files`);
  else add('pass', 'skill-length', `${lines.length} lines`);

  // 3) L1 description specificity: must name trigger context + output, not be generic.
  //    A description passes when it is substantial AND names either a station
  //    context or an explicit "Use when ..." trigger. Requiring one narrow noun
  //    (Station/issue/plan) rejects valid descriptions that trigger on user
  //    phrasing instead, e.g. skill-workbench's "Use when the user says ...".
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  // `description` may be the last frontmatter key, so terminate on the next
  // key OR the end of the block.
  const desc = fm ? (fm[1].match(/description:\s*([\s\S]*?)\r?\n[a-zA-Z][\w-]*:/)
    || fm[1].match(/description:\s*([^\r\n]*)/)
    || [])[1] || '' : '';
  const descText = desc.trim().replace(/^["']|["']$/g, '');
  const specificity =
    descText.length > 80 &&
    (/(Station|issue|plan|GitHub|tasks\/plan\.md)/i.test(descText) ||
      /(Use when|when the user|trigger)/i.test(descText));
  add(specificity ? 'pass' : 'fail', 'l1-description',
    specificity ? 'Description names trigger context and outputs' : `Description too generic or short: "${descText.slice(0, 120)}"`);

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

/**
 * The station contract plus its on-demand references. A skill that splits its
 * detail into references/ is still one contract: an assertion about Step 4 must
 * pass whether the prose lives in SKILL.md or in the file that step points at.
 */
function corpus(skillPath) {
  let text = read(skillPath);
  const refs = path.join(path.dirname(skillPath), 'references');
  let entries = [];
  try { entries = fs.readdirSync(refs).filter((f) => /\.md$/i.test(f)).sort(); } catch { return text; }
  for (const f of entries) {
    try { text += '\n\n' + read(path.join(refs, f)); } catch { /* unreadable ref is not fatal here */ }
  }
  return text;
}

function extractTemplate(text) {
  // The Hebrew report template = first fenced ```markdown block.
  const m = text.match(/```markdown\r?\n([\s\S]*?)\r?\n```/);
  if (!m) return null;
  return m[1];
}

/** Same as extractTemplate, but falls back to the referenced template file.
 *
 *  The Hebrew output contract was extracted out of SKILL.md into
 *  references/output-template.md (local-only; the sync strips the pointer block).
 *  A grader that only scans SKILL.md would then find no template at all and
 *  report every max_template_lines assertion as a failure that no amount of
 *  editing SKILL.md could fix. Resolve the pointer so the assertion measures the
 *  template that is actually shipped.
 */
function extractTemplateFor(skillPath, text) {
  const inline = extractTemplate(text);
  if (inline) return inline;
  const ref = text.match(/references\/output-template\.md/);
  if (!ref) return null;
  const p = path.join(path.dirname(skillPath), 'references', 'output-template.md');
  try {
    if (!fs.existsSync(p)) return null;
    const m = fs.readFileSync(p, 'utf8').match(/```markdown\r?\n([\s\S]*?)\r?\n```/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
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

/**
 * Windows reserved device names, with or without an extension (nul, nul.txt).
 *
 * Git Bash rewrites a `/dev/null` argument to the bare string `nul` before node
 * ever sees it, so `--out /dev/null` used to leave a real file named `nul` in
 * the working directory - untracked, unignored, and one `git add -A` from being
 * committed. A null sink is a request to discard, so discard instead of writing.
 */
const WIN_DEVICE_RE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
function isDiscardTarget(p) {
  if (!p) return true;
  const norm = String(p).trim().replace(/\\/g, '/').replace(/\/+$/, '');
  return norm === '' || norm === '/dev/null' || norm === '/dev/nul' || WIN_DEVICE_RE.test(norm);
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
    const skillArg = arg('skill');
    const text = corpus(skillArg);
    const tpl = extractTemplateFor(skillArg, text);
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
    if (isDiscardTarget(outPath)) {
      if (outPath) console.error(`[grade] --out "${outPath}" is a null sink; output discarded, nothing written.`);
    } else {
      fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    }
    console.log(JSON.stringify(summary, null, 2));
    process.exitCode = totalStatic - totalPassed > 0 ? 1 : 0;
    return;
  }

  console.error('usage: grade.js audit --skill <SKILL.md> | case --evals <evals.json> --skill <SKILL.md> [--id x] [--out f.json]');
  process.exitCode = 2;
}

main();
