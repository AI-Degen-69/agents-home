// Proves the delivery gate can FAIL. A gate that cannot fail is the exact
// defect this file exists to prevent, so each case plants a specific remote
// state and asserts a non-zero exit plus a named failing check.
//
// Hermetic: `gh` and `git` are Node stubs fed by fixture files passed through
// the environment, so no network and no real remote is touched.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, '..', 'scripts', 'verify-delivered-prs.js');
const tmpRoot = mkdtempSync(join(tmpdir(), 'verify-delivered-'));
const NL = String.fromCharCode(10);

const GOOD_PR = {
  number: 60,
  title: '[IMPROVE] Update version labels',
  body: 'Iteration 1 on improve/loop-iter-1-version-catalog-truth',
  headRefName: 'improve/loop-iter-1-version-catalog-truth',
  headRefOid: 'dc764096c776336ca551a48e71051f7573fb6a3b',
  state: 'OPEN',
  isDraft: false,
};

function manifestFor(overrides = {}) {
  return {
    repo: 'owner/repo',
    prs: [{
      iteration: 1,
      number: 60,
      branch: 'improve/loop-iter-1-version-catalog-truth',
      title: '[IMPROVE] Update version labels',
      headSha: 'dc76409',
      tag: 'loop-iter-1-20261005-044459',
      ...overrides,
    }],
  };
}

/**
 * Build stub gh + git that emit the given PR JSON / tag line. They are Node
 * scripts rather than shell or .cmd shims so the same fixture runs identically
 * on every platform, with no shell quoting or PATHEXT in the picture.
 */
function stub({ pr = GOOD_PR, tagSha = 'dc764096c7', prExit = 0 } = {}) {
  const dir = mkdtempSync(join(tmpRoot, 'case-'));
  const payload = typeof pr === 'string' ? pr : JSON.stringify(pr);
  const prFile = join(dir, 'pr-payload.txt');
  writeFileSync(prFile, payload);
  const tagFile = join(dir, 'tag-payload.txt');
  writeFileSync(tagFile, tagSha ? tagSha + '\trefs/tags/loop-iter-1-20261005-044459' + NL : '');

  const gh = join(dir, 'gh-stub.js');
  writeFileSync(gh,
    'import { readFileSync } from "node:fs";' + NL +
    'process.stdout.write(readFileSync(process.env.STUB_GH_PAYLOAD, "utf8"));' + NL +
    'process.exit(' + prExit + ');' + NL);
  const git = join(dir, 'git-stub.js');
  writeFileSync(git,
    'import { readFileSync } from "node:fs";' + NL +
    'process.stdout.write(readFileSync(process.env.STUB_GIT_PAYLOAD, "utf8"));' + NL);

  // Payload paths travel via env, so the gate's own argv stays clean.
  return { dir, gh, git, prFile, tagFile };
}

function runGate({ manifest, ...stubOpts }) {
  const { dir, gh, git, prFile, tagFile } = stub(stubOpts);
  const manifestPath = join(dir, 'loop-delivery.json');
  writeFileSync(manifestPath, JSON.stringify(manifest ?? manifestFor()));
  const res = spawnSync(process.execPath, [
    SCRIPT, '--manifest', manifestPath, '--gh-bin', gh, '--git-bin', git,
  ], { encoding: 'utf8', env: { ...process.env, STUB_GH_PAYLOAD: prFile, STUB_GIT_PAYLOAD: tagFile } });
  return { code: res.status, out: res.stdout, err: res.stderr };
}

test('PASSES when the remote matches the manifest exactly', () => {
  const r = runGate({});
  assert.equal(r.code, 0, `expected clean exit, got ${r.code}\n${r.out}\n${r.err}`);
  assert.match(r.out, /OK: every created PR matches/);
  // Value, not just exit status: the field names must actually be checked.
  for (const field of ['title', 'head SHA', 'body non-empty', 'checkpoint tag']) {
    // Substring, not a regex: a template literal turns \\s into s, which is
    // how this assertion silently stopped matching anything.
    assert.ok(
      r.out.includes('PASS  ' + field),
      'no PASS line for "' + field + '" in:' + NL + r.out,
    );
  }
});

test('FAILS when the title was clobbered (the real defect)', () => {
  const r = runGate({ pr: { ...GOOD_PR, title: '@coderabbitai' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+title/);
  // Both sides named, so the operator sees what happened without guessing.
  assert.match(r.out, /expected: \[IMPROVE\] Update version labels/);
  assert.match(r.out, /actual:\s+@coderabbitai/);
  assert.match(r.err, /Do NOT record these iterations as delivered/);
});

test('FAILS on an empty body', () => {
  const r = runGate({ pr: { ...GOOD_PR, body: '   ' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+body non-empty/);
});

test('FAILS when the body does not name its branch', () => {
  const r = runGate({ pr: { ...GOOD_PR, body: 'no branch mentioned here' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+body names its branch/);
});

test('FAILS when head SHA moved past the recorded checkpoint', () => {
  const r = runGate({ pr: { ...GOOD_PR, headRefOid: 'aaaaaaabbbbbbbbaaaaaaabbbbbbbbaaaaaaabbbbbbbb' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+head SHA/);
});

test('FAILS when the head branch is not the one pushed', () => {
  const r = runGate({ pr: { ...GOOD_PR, headRefName: 'improve/some-other-branch' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+head branch/);
});

test('FAILS when the PR is a draft', () => {
  const r = runGate({ pr: { ...GOOD_PR, isDraft: true } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+not a draft/);
});

test('FAILS when the PR is closed', () => {
  const r = runGate({ pr: { ...GOOD_PR, state: 'CLOSED' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+state/);
});

test('FAILS when the checkpoint tag is missing from the remote', () => {
  const r = runGate({ tagSha: '' });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+checkpoint tag/);
});

test('FAILS when gh errors - an unreadable PR is never a pass', () => {
  const r = runGate({ prExit: 1, pr: '' });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+PR readable from remote/);
});

test('FAILS when gh returns unparseable JSON', () => {
  const r = runGate({ pr: 'not json at all' });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+PR readable from remote/);
});

test('FAILS on a missing manifest rather than reporting success', () => {
  const { gh, git, dir, prFile, tagFile } = stub();
  const res = spawnSync(process.execPath, [
    SCRIPT, '--manifest', join(dir, 'nope.json'), '--gh-bin', gh, '--git-bin', git,
  ], { encoding: 'utf8', env: { ...process.env, STUB_GH_PAYLOAD: prFile, STUB_GIT_PAYLOAD: tagFile } });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /cannot read delivery manifest/);
});

test('FAILS on an empty PR list - zero PRs is not a pass', () => {
  const r = runGate({ manifest: { repo: 'owner/repo', prs: [] } });
  assert.equal(r.code, 1);
  assert.match(r.err, /lists no PRs/);
});

test('FAILS when a manifest entry omits a required field', () => {
  const m = manifestFor();
  delete m.prs[0].title;
  const r = runGate({ manifest: m });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL\s+manifest entry complete/);
});

test('checks every PR in the manifest, not just the first', () => {
  const m = manifestFor();
  m.prs.push({ ...m.prs[0], iteration: 2, number: 61, title: 'second PR' });
  // Both are reported, and the clobbered title is caught on both.
  const r = runGate({ manifest: m, pr: { ...GOOD_PR, title: '@coderabbitai' } });
  assert.equal(r.code, 1);
  assert.match(r.out, /PR #60/);
  assert.match(r.out, /PR #61/);
});

test.after(() => rmSync(tmpRoot, { recursive: true, force: true }));