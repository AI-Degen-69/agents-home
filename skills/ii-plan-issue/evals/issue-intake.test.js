'use strict';
/**
 * Unit tests for skills/ii-plan-issue/scripts/issue-intake.js.
 * Zero external dependencies. Uses Node test runner (node --test).
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  detectStack,
  checkGitState,
  inspectStalePlans,
} = require('../scripts/issue-intake.js');

describe('issue-intake preflight script', () => {
  it('detects git state on the current working directory', () => {
    const git = checkGitState(path.resolve(__dirname, '..', '..', '..'));
    assert.equal(git.isGit, true);
    assert.ok(typeof git.currentBranch === 'string');
    assert.ok(typeof git.isClean === 'boolean');
  });

  it('detects tech stack correctly', () => {
    const stack = detectStack(path.resolve(__dirname, '..', '..', '..'));
    assert.ok(Array.isArray(stack.languages));
  });

  it('inspects stale plans with issue mismatch correctly', (t) => {
    const tempDir = path.join(__dirname, 'temp-test-dir');
    fs.mkdirSync(path.join(tempDir, 'tasks'), { recursive: true });

    // Write a plan for issue #99
    fs.writeFileSync(
      path.join(tempDir, 'tasks', 'plan.md'),
      '# Branch: i99/test | Issue: #99\n\nSome task\n'
    );

    // Intake for issue #42
    const result = inspectStalePlans(tempDir, 42);
    assert.equal(result.hasStalePlan, true);
    assert.equal(result.details.length, 1);
    assert.equal(result.details[0].recordedIssue, '99');
    assert.equal(result.details[0].mismatch, true);

    // Intake for matching issue #99
    const matchResult = inspectStalePlans(tempDir, 99);
    assert.equal(matchResult.hasStalePlan, false);
    assert.equal(matchResult.details[0].mismatch, false);

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('runs via CLI and supports --help and --json', () => {
    const scriptPath = path.resolve(__dirname, '..', 'scripts', 'issue-intake.js');

    const helpRes = execFileSync('node', [scriptPath, '--help'], { encoding: 'utf8' });
    assert.match(helpRes, /Usage: node scripts\/issue-intake\.js/);

    const jsonRes = execFileSync('node', [scriptPath, '--json'], { encoding: 'utf8' });
    const parsed = JSON.parse(jsonRes);
    assert.ok(parsed.timestamp);
    assert.ok(parsed.git);
    assert.ok(parsed.stack);
    assert.ok(parsed.plans);
  });
});
