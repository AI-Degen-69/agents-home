// Unit tests for verify-vendored-chain.js
// Proves that the chain validator passes when intact and detects missing files or broken references.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, '..', 'scripts', 'verify-vendored-chain.js');

test('verify-vendored-chain passes on live skills root with --skip-tests', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--skip-tests'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, `Script failed:\n${r.stderr || r.stdout}`);
  assert.match(r.stdout, /ALL 5 CHECKS PASSED/);
});

test('verify-vendored-chain --json outputs valid JSON structure', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--skip-tests', '--json'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  const data = JSON.parse(r.stdout);
  assert.equal(data.ok, true);
  assert.equal(data.checks.length, 5);
  assert.equal(data.checks[0].ok, true);
});

test('verify-vendored-chain detects missing skill folder or companion', () => {
  const tempSkills = mkdtempSync(join(tmpdir(), 'chain-test-'));
  try {
    // Run against empty temp dir as skills-root
    const r = spawnSync(process.execPath, [SCRIPT, '--skills-root', tempSkills, '--skip-tests'], {
      encoding: 'utf8',
    });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /FAILURES DETECTED/);
    assert.match(r.stdout, /Skill folder missing/);
  } finally {
    rmSync(tempSkills, { recursive: true, force: true });
  }
});
