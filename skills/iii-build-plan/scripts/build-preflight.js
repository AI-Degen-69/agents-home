#!/usr/bin/env node
'use strict';
/**
 * build-preflight.js — Station III (Build) Automated Pre-flight Inspector.
 *
 * Verifies Phase 1 preconditions before touching code:
 * 1. tasks/plan.md existence and parse open/completed tasks.
 * 2. Current git branch vs. plan feature branch (i<number>/<slug>).
 * 3. Git worktree and working tree dirt status.
 * 4. CONSTRAINTS.md existence.
 * 5. Next open task, domain tag routing recommendation, and quick-fix divert eligibility.
 *
 * Zero dependencies. Node >= 18.
 * Usage:
 *   node scripts/build-preflight.js [--plan <path>] [--json] [--help]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd: cwd || process.cwd(), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return null;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { json: false, plan: null, help: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') opts.json = true;
    else if (args[i] === '--help' || args[i] === '-h') opts.help = true;
    else if (args[i] === '--plan' && i + 1 < args.length) opts.plan = args[++i];
  }
  return opts;
}

function findPlan(explicitPlan) {
  if (explicitPlan) {
    const p = path.resolve(process.cwd(), explicitPlan);
    return fs.existsSync(p) ? p : null;
  }
  const candidates = [
    path.resolve(process.cwd(), 'tasks', 'plan.md'),
    path.resolve(process.cwd(), 'plan.md'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function parsePlan(content) {
  const lines = content.split(/\r?\n/);
  const tasks = [];
  let headerIssue = null;
  let headerBranch = null;

  for (const line of lines) {
    const issueMatch = line.match(/#\s*(?:Issue|#)\s*(\d+)/i) || line.match(/issue[:\s]+#?(\d+)/i);
    if (!headerIssue && issueMatch) headerIssue = issueMatch[1];

    const branchMatch = line.match(/branch[:\s]+`?([a-zA-Z0-9_\-\/]+)`?/i);
    if (!headerBranch && branchMatch) headerBranch = branchMatch[1];

    // Check task lines: - [ ] Task description or 1. [ ] Task
    const taskMatch = line.match(/^[\s*-]*(\d+\.|\*|-)?\s*\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const done = taskMatch[2].toLowerCase() === 'x';
      const desc = taskMatch[3].trim();
      const domainMatch = desc.match(/\[([a-zA-Z0-9_\-\/\s]+)\]/);
      const domainTag = domainMatch ? domainMatch[1].trim() : null;
      tasks.push({ done, description: desc, domainTag });
    }
  }

  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  return { headerIssue, headerBranch, tasks, openTasks, doneTasks };
}

function detectDomainRoute(domainTag, description) {
  const text = `${domainTag || ''} ${description || ''}`.toLowerCase();
  if (/ui|frontend|css|style|design|component|view/.test(text)) {
    return { skill: 'frontend-ui-engineering', category: 'UI / Frontend' };
  }
  if (/debug|defect|fix|bug|error|crash/.test(text)) {
    return { skill: 'debugging-and-error-recovery', category: 'Debug / Defect' };
  }
  if (/perf|performance|optimize|speed|slow|latency/.test(text)) {
    return { skill: 'performance-optimization', category: 'Performance' };
  }
  if (/sec|security|auth|token|crypt|secret|harden/.test(text)) {
    return { skill: 'security-and-hardening', category: 'Security' };
  }
  if (/doc|adr|readme|guide/.test(text)) {
    return { skill: 'documentation-and-adrs', category: 'Documentation' };
  }
  return { skill: 'test-driven-development', category: 'Code / Backend / API' };
}

function inspectPreflight(opts) {
  const root = process.cwd();
  const planPath = findPlan(opts.plan);
  const branch = run('git branch --show-current', root) || 'unknown';
  const gitStatusRaw = run('git status --short', root) || '';
  const dirtyFiles = gitStatusRaw ? gitStatusRaw.split(/\r?\n/).filter(Boolean) : [];
  const worktreesRaw = run('git worktree list', root) || '';
  const worktreeCount = worktreesRaw ? worktreesRaw.split(/\r?\n/).filter(Boolean).length : 1;
  const constraintsPath = path.resolve(root, 'CONSTRAINTS.md');
  const hasConstraints = fs.existsSync(constraintsPath);

  const errors = [];
  const warnings = [];

  if (!planPath) {
    errors.push('No plan found! Run /ii-plan-issue first (tasks/plan.md is missing).');
    return {
      ok: false,
      errors,
      warnings,
      branch,
      dirtyFiles,
      plan: null,
      nextTask: null,
    };
  }

  const planContent = fs.readFileSync(planPath, 'utf8');
  const planData = parsePlan(planContent);

  if (planData.tasks.length === 0) {
    warnings.push('tasks/plan.md contains no task checkboxes (- [ ] / - [x]).');
  }

  if (planData.openTasks.length === 0 && planData.tasks.length > 0) {
    warnings.push('All tasks in tasks/plan.md are already marked completed [x].');
  }

  // Branch check
  if (branch === 'main' || branch === 'master') {
    warnings.push(`Currently on base branch "${branch}". Station III expects feature branch (e.g. i<number>/slug).`);
  }

  // Next open task
  const next = planData.openTasks[0] || null;
  const nextRouting = next ? detectDomainRoute(next.domainTag, next.description) : null;

  // Quick-fix divert candidate evaluation (fresh plan with nothing done, <= 2 tasks)
  const isFresh = planData.doneTasks.length === 0 && planData.tasks.length > 0;
  const isQuickFixCandidate = isFresh && planData.tasks.length <= 2;

  const ok = errors.length === 0;

  return {
    ok,
    errors,
    warnings,
    cwd: root,
    branch,
    worktreeCount,
    hasConstraints,
    dirtyCount: dirtyFiles.length,
    dirtyFiles,
    planPath: path.relative(root, planPath),
    totalTasks: planData.tasks.length,
    openTasksCount: planData.openTasks.length,
    doneTasksCount: planData.doneTasks.length,
    nextTask: next
      ? {
          description: next.description,
          domainTag: next.domainTag,
          recommendedSkill: nextRouting.skill,
          category: nextRouting.category,
        }
      : null,
    quickFixDivertEligible: isQuickFixCandidate,
  };
}

function printHelp() {
  console.log(`build-preflight.js — Station III (Build) Automated Pre-flight Inspector

Usage:
  node scripts/build-preflight.js [options]

Options:
  --plan <path>   Explicit path to tasks/plan.md (default: ./tasks/plan.md)
  --json          Output structured JSON
  --help, -h      Show this help message
`);
}

function main() {
  const opts = parseArgs();
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const result = inspectPreflight(opts);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' 🔨 Station III (Build) — Pre-flight Check');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📍 CWD:          ${result.cwd}`);
  console.log(`🌿 Branch:       ${result.branch}`);
  console.log(`🌲 Worktrees:    ${result.worktreeCount}`);
  console.log(`🔒 CONSTRAINTS:  ${result.hasConstraints ? 'Found (active)' : 'None'}`);
  console.log(`📂 Dirt files:   ${result.dirtyCount}`);
  console.log(`📋 Plan file:    ${result.planPath || 'MISSING'}\n`);

  if (result.errors.length) {
    console.log('🔴 BLOCKERS:');
    result.errors.forEach((e) => console.log(`  - ${e}`));
    console.log();
  }

  if (result.warnings.length) {
    console.log('⚠️ WARNINGS:');
    result.warnings.forEach((w) => console.log(`  - ${w}`));
    console.log();
  }

  if (result.totalTasks !== undefined) {
    console.log(`📊 Tasks: ${result.doneTasksCount}/${result.totalTasks} completed (${result.openTasksCount} remaining)`);
  }

  if (result.nextTask) {
    console.log('\n🎯 Next Task to Implement:');
    console.log(`  Description: ${result.nextTask.description}`);
    console.log(`  Tag:         ${result.nextTask.domainTag || 'None'}`);
    console.log(`  Route to:    ${result.nextTask.recommendedSkill} (${result.nextTask.category})`);
  }

  if (result.quickFixDivertEligible) {
    console.log('\n⚡ Quick-Fix Candidate: Fresh plan with <= 2 tasks. Check issue label for quick-fix divert.');
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`Status: ${result.ok ? '🟢 READY FOR BUILD' : '🔴 HALTED'}`);
  console.log('───────────────────────────────────────────────────────────');

  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { inspectPreflight, parsePlan, detectDomainRoute, findPlan };
