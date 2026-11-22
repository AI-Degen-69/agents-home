// Unit tests for repo-triage.js
// Verifies argument parsing, git status detection, and JSON output structure.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, '..', 'scripts', 'repo-triage.js');

test('repo-triage runs cleanly on live git repo with text output', () => {
  const r = spawnSync(process.execPath, [SCRIPT], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, `Script failed:\n${r.stderr || r.stdout}`);
  assert.match(r.stdout, /Forensic Repository Triage/);
  assert.match(r.stdout, /Working Tree Status/);
  assert.match(r.stdout, /Branches/);
});

test('repo-triage --json outputs expected schema', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--json'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  const data = JSON.parse(r.stdout);
  assert.equal(typeof data.base, 'string');
  assert.ok(Array.isArray(data.dirtyFiles));
  assert.ok(Array.isArray(data.worktrees));
  assert.ok(Array.isArray(data.branches));
  assert.ok(Array.isArray(data.stashes));
  assert.ok(Array.isArray(data.prs));
  assert.ok(Array.isArray(data.issues));
});

test('repo-triage --help prints help text and exits 0', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--help'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage:/);
});
