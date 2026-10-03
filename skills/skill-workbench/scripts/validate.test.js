#!/usr/bin/env node
/**
 * Regression checks for validate-lib.js. Zero dependencies, `node:test`, Node >= 18.
 *
 * Run:  node skills/skill-workbench/scripts/validate.test.js
 *
 * Every fixture is built in the OS temp directory and removed afterwards —
 * nothing is ever written inside the repository.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateSkill, phantomSkillRefs, isNonSkillVocabulary, parseFrontmatter,
} = require('./validate-lib.js');

/** A throwaway skills root with one real skill and one real agent persona. */
function makeFixtureRoot() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-workbench-validate-'));
  const skillsRoot = path.join(base, 'skills');
  const agentsRoot = path.join(base, 'agents');
  fs.mkdirSync(skillsRoot);
  fs.mkdirSync(agentsRoot);
  fs.mkdirSync(path.join(skillsRoot, 'real-skill'));
  fs.writeFileSync(path.join(skillsRoot, 'real-skill', 'SKILL.md'), '---\nname: real-skill\ndescription: x\n---\n');
  fs.writeFileSync(path.join(agentsRoot, 'real-persona.md'), '# persona\n');
  return {
    base, skillsRoot, agentsRoot,
    cleanup: () => fs.rmSync(base, { recursive: true, force: true }),
  };
}

/** Write a SKILL.md into a throwaway skill folder and validate it. */
function validateBody(body, fixture, folderName) {
  const dir = path.join(fixture.base, 'case-' + (folderName || 'x'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), body);
  return validateSkill(dir, { skillsRoot: fixture.skillsRoot });
}

const finding = (r, check) => r.findings.find((f) => f.check === check);

test('missing frontmatter yields findings, never a throw', () => {
  const fx = makeFixtureRoot();
  try {
    const r = validateBody('# No frontmatter here\n\nbody only\n', fx);
    assert.strictEqual(finding(r, 'fm-present').severity, 'fail');
    assert.ok(finding(r, 'fm-skipped'), 'fm-skipped warning must explain the skipped checks');
    for (const c of ['fm-name-valid', 'fm-name-matches', 'fm-desc-nonempty', 'fm-compat-len']) {
      assert.strictEqual(finding(r, c), undefined, `${c} must not report without frontmatter`);
    }
    assert.strictEqual(finding(r, 'body-length').severity, 'pass');
  } finally { fx.cleanup(); }
});

test('unclosed frontmatter yields findings, never a throw', () => {
  const fx = makeFixtureRoot();
  try {
    const r = validateBody('---\nname: case-x\ndescription: d\n\n# body, delimiter never closed\n', fx);
    assert.strictEqual(finding(r, 'fm-present').severity, 'fail');
  } finally { fx.cleanup(); }
});

test('CRLF frontmatter parses exactly like LF frontmatter', () => {
  const fx = makeFixtureRoot();
  try {
    const r = validateBody('---\r\nname: case-x\r\ndescription: d\r\n---\r\n\r\n# body\r\n', fx);
    assert.strictEqual(finding(r, 'fm-present').severity, 'pass');
    assert.strictEqual(finding(r, 'fm-name-valid').severity, 'pass');
    assert.strictEqual(finding(r, 'fm-desc-nonempty').severity, 'pass');
  } finally { fx.cleanup(); }
});

test('a genuine missing skill name still fails phantom-skill-refs', () => {
  const fx = makeFixtureRoot();
  try {
    const r = validateBody('---\nname: case-x\ndescription: d\n---\n\nUse `ghost-skill` here.\n', fx);
    assert.strictEqual(finding(r, 'phantom-skill-refs').severity, 'fail');
    assert.match(finding(r, 'phantom-skill-refs').detail, /ghost-skill/);
  } finally { fx.cleanup(); }
});

test('near-miss tokens are NOT exempt — no blanket prefix exclusion', () => {
  for (const token of ['bg-cleanup', 'data-import-skill', 'text-nonsense', 'size-large']) {
    assert.strictEqual(isNonSkillVocabulary(token), false, `${token} must stay a phantom candidate`);
  }
});

test('a real skill folder and a real persona both resolve', () => {
  const fx = makeFixtureRoot();
  try {
    const r = validateBody(
      '---\nname: case-x\ndescription: d\n---\n\nInvoke `real-skill` and `real-persona`.\n', fx);
    assert.strictEqual(finding(r, 'phantom-skill-refs').severity, 'pass');
  } finally { fx.cleanup(); }
});

test('CSS, ARIA, data-state and package vocabulary are exempt', () => {
  const tokens = [
    'bg-primary', 'text-muted-foreground', 'bg-blue-500', 'size-10', 'bg-background',
    'z-index', 'data-invalid', 'aria-invalid', 'data-disabled', 'data-icon',
    'animate-pulse', 'size-4', 'lucide-react', 'react-router',
    'border-input', 'text-destructive-foreground', 'bg-slate-100',
  ];
  for (const t of tokens) assert.strictEqual(isNonSkillVocabulary(t), true, `${t} must be exempt`);
});

test('an unknown skill name that shares a Tailwind prefix still fails end to end', () => {
  const fx = makeFixtureRoot();
  try {
    const r = validateBody('---\nname: case-x\ndescription: d\n---\n\nUse `bg-wizardcraft` here.\n', fx);
    assert.strictEqual(finding(r, 'phantom-skill-refs').severity, 'fail');
    assert.match(finding(r, 'phantom-skill-refs').detail, /bg-wizardcraft/);
  } finally { fx.cleanup(); }
});

test("the skill's own file basenames are exempt", () => {
  const fx = makeFixtureRoot();
  try {
    const dir = path.join(fx.base, 'case-own');
    fs.mkdirSync(path.join(dir, 'references'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'),
      '---\nname: case-own\ndescription: d\n---\n\nSee [t](references/output-template.md).\n');
    fs.writeFileSync(path.join(dir, 'references', 'output-template.md'), '# t\n');
    const r = validateSkill(dir, { skillsRoot: fx.skillsRoot });
    assert.strictEqual(finding(r, 'file-refs').severity, 'pass');
    assert.deepStrictEqual(
      phantomSkillRefs('use `output-template` here', dir, fx.skillsRoot), []);
  } finally { fx.cleanup(); }
});

test('a missing SKILL.md reports fm-present without reading it', () => {
  const fx = makeFixtureRoot();
  try {
    const dir = path.join(fx.base, 'case-empty');
    fs.mkdirSync(dir);
    const r = validateSkill(dir, { skillsRoot: fx.skillsRoot });
    assert.strictEqual(finding(r, 'fm-present').severity, 'fail');
  } finally { fx.cleanup(); }
});

test('the default skills root follows the script, not a hardcoded path', () => {
  const expected = path.resolve(__dirname, '..', '..');
  assert.strictEqual(require('./validate-lib.js').DEFAULT_SKILLS_ROOT, expected);
  assert.ok(fs.existsSync(path.join(expected, 'skill-workbench')), 'derived root must contain skills');
});

test('parseFrontmatter keeps folded scalars intact', () => {
  const fm = parseFrontmatter('---\nname: x\ndescription: one\n  two\n---\nbody');
  assert.strictEqual(fm.fm.description, 'one two');
});
