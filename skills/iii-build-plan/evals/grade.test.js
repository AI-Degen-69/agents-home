'use strict';
/**
 * grade.test.js — Unit test suite for iii-build-plan scripts (grade.js & build-preflight.js).
 * Native Node test runner (node --test). Zero external dependencies.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SKILL_DIR = path.resolve(__dirname, '..');
const SKILL_MD = path.join(SKILL_DIR, 'SKILL.md');
const EVALS_JSON = path.join(SKILL_DIR, 'evals', 'evals.json');
const GRADE_JS = path.join(SKILL_DIR, 'scripts', 'grade.js');
const PREFLIGHT_JS = path.join(SKILL_DIR, 'scripts', 'build-preflight.js');

describe('iii-build-plan: grade.js', () => {
  it('grade.js audit executes and returns 0 fails and passes canonical-examples', () => {
    const raw = execSync(`node "${GRADE_JS}" audit --skill "${SKILL_MD}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.skill, SKILL_MD);
    assert(Array.isArray(parsed.findings), 'findings should be an array');
    const fails = parsed.findings.filter((f) => f.severity === 'fail');
    assert.strictEqual(fails.length, 0, `Expected 0 fails in audit, got: ${JSON.stringify(fails)}`);

    const canon = parsed.findings.find((f) => f.check === 'canonical-examples');
    assert(canon, 'canonical-examples check must exist');
    assert.strictEqual(canon.severity, 'pass', 'canonical-examples must pass');
  });

  it('grade.js case runs all static assertions against SKILL.md with 100% pass rate', () => {
    const raw = execSync(`node "${GRADE_JS}" case --evals "${EVALS_JSON}" --skill "${SKILL_MD}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.cases, 3);
    assert.strictEqual(parsed.static_failed, 0);
    assert.strictEqual(parsed.static_pass_rate, 1);
  });
});

describe('iii-build-plan: build-preflight.js', () => {
  const { parsePlan, detectDomainRoute } = require(PREFLIGHT_JS);

  it('parsePlan accurately parses tasks, issue id, branch and completion status', () => {
    const mockPlan = `
# Issue #42: Feature Authentication
Branch: \`i42/auth-flow\`

## Tasks
- [x] Setup database models [Backend]
- [ ] Implement login endpoint [API]
- [ ] Build login form component [UI]
`;
    const data = parsePlan(mockPlan);
    assert.strictEqual(data.headerIssue, '42');
    assert.strictEqual(data.headerBranch, 'i42/auth-flow');
    assert.strictEqual(data.tasks.length, 3);
    assert.strictEqual(data.doneTasks.length, 1);
    assert.strictEqual(data.openTasks.length, 2);
    assert.strictEqual(data.openTasks[0].description, 'Implement login endpoint [API]');
    assert.strictEqual(data.openTasks[1].description, 'Build login form component [UI]');
  });

  it('detectDomainRoute maps domain tags and keywords to specialized skills', () => {
    assert.strictEqual(detectDomainRoute('UI', 'Build modal').skill, 'frontend-ui-engineering');
    assert.strictEqual(detectDomainRoute('Backend', 'Write service').skill, 'test-driven-development');
    assert.strictEqual(detectDomainRoute('Debug', 'Fix null pointer').skill, 'debugging-and-error-recovery');
    assert.strictEqual(detectDomainRoute('Perf', 'Optimize query latency').skill, 'performance-optimization');
    assert.strictEqual(detectDomainRoute('Security', 'Audit token handling').skill, 'security-and-hardening');
    assert.strictEqual(detectDomainRoute('Docs', 'Write ADR').skill, 'documentation-and-adrs');
  });

  it('CLI --help exits 0 with usage instructions', () => {
    const out = execSync(`node "${PREFLIGHT_JS}" --help`, { encoding: 'utf8' });
    assert(out.includes('Station III (Build) Automated Pre-flight Inspector'));
    assert(out.includes('--plan <path>'));
  });

  it('CLI exits with error code 1 when no plan exists', () => {
    let errCode = 0;
    try {
      execSync(`node "${PREFLIGHT_JS}" --plan "non-existent-plan-xyz.md" --json`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      errCode = e.status;
      const parsed = JSON.parse(e.stdout);
      assert.strictEqual(parsed.ok, false);
      assert(parsed.errors.some((err) => err.includes('No plan found')));
    }
    assert.strictEqual(errCode, 1, 'Expected non-zero exit code when plan is missing');
  });
});
