#!/usr/bin/env node
/**
 * Automated intake and pre-flight data collector for ii-plan-issue (Station II).
 * Zero dependencies. Node >= 18.
 *
 * Inspects repository state, detects tech stack and test runners, fetches target
 * or top-priority GitHub issues, and checks for stale planning artifacts.
 *
 * Usage:
 *   node scripts/issue-intake.js [issue-number] [options]
 *
 * Options:
 *   --issue <number>   Specific issue number to intake
 *   --dir <path>       Target repository path (default: current directory)
 *   --json             Output results as JSON
 *   --help, -h         Show this help
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function parseArgs(argv) {
  const opts = {
    dir: process.cwd(),
    issue: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      opts.help = true;
    } else if (a === '--dir') {
      opts.dir = path.resolve(argv[++i]);
    } else if (a === '--issue') {
      opts.issue = argv[++i];
    } else if (a === '--json') {
      opts.json = true;
    } else if (/^\d+$/.test(a) && !opts.issue) {
      opts.issue = a;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }

  return opts;
}

function runCmd(cmd, args, cwd) {
  try {
    const out = execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, out: out.trim() };
  } catch (err) {
    const detail = (err.stderr || err.stdout || err.message || '').trim();
    return { ok: false, out: '', err: detail, code: err.status ?? 1 };
  }
}

function detectStack(targetDir) {
  const stack = {
    languages: [],
    testRunner: null,
    frameworks: [],
    packageManager: null,
  };

  // Node.js
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    stack.languages.push('javascript/typescript');
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.scripts && pkg.scripts.test) {
        if (/vitest/i.test(pkg.scripts.test)) stack.testRunner = 'vitest';
        else if (/jest/i.test(pkg.scripts.test)) stack.testRunner = 'jest';
        else if (/playwright/i.test(pkg.scripts.test)) stack.testRunner = 'playwright';
        else stack.testRunner = `npm test (${pkg.scripts.test})`;
      }
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (allDeps.next) stack.frameworks.push('next.js');
      if (allDeps.react) stack.frameworks.push('react');
      if (allDeps.express) stack.frameworks.push('express');
      if (allDeps.fastify) stack.frameworks.push('fastify');
      if (allDeps.tailwindcss) stack.frameworks.push('tailwind');
      if (allDeps.typescript) stack.languages.push('typescript');
    } catch {
      // Invalid json - non-fatal
    }

    if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) stack.packageManager = 'pnpm';
    else if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) stack.packageManager = 'yarn';
    else if (fs.existsSync(path.join(targetDir, 'bun.lockb')) || fs.existsSync(path.join(targetDir, 'bun.lock'))) stack.packageManager = 'bun';
    else if (fs.existsSync(path.join(targetDir, 'package-lock.json'))) stack.packageManager = 'npm';
  }

  // Rust
  const cargoPath = path.join(targetDir, 'Cargo.toml');
  if (fs.existsSync(cargoPath)) {
    stack.languages.push('rust');
    if (!stack.testRunner) stack.testRunner = 'cargo test';
  }

  // Python
  const pyproject = path.join(targetDir, 'pyproject.toml');
  const setupPy = path.join(targetDir, 'setup.py');
  if (fs.existsSync(pyproject) || fs.existsSync(setupPy)) {
    stack.languages.push('python');
    if (!stack.testRunner) stack.testRunner = 'pytest';
  }

  // Go
  const goMod = path.join(targetDir, 'go.mod');
  if (fs.existsSync(goMod)) {
    stack.languages.push('go');
    if (!stack.testRunner) stack.testRunner = 'go test ./...';
  }

  return stack;
}

function checkGitState(targetDir) {
  const isGit = runCmd('git', ['rev-parse', '--is-inside-work-tree'], targetDir);
  if (!isGit.ok) {
    return { isGit: false };
  }

  const branchRes = runCmd('git', ['branch', '--show-current'], targetDir);
  const currentBranch = branchRes.ok ? branchRes.out : 'HEAD';

  // Base branch detection
  let baseBranch = 'main';
  const hasMain = runCmd('git', ['show-ref', '--verify', '--quiet', 'refs/heads/main'], targetDir).ok;
  const hasMaster = runCmd('git', ['show-ref', '--verify', '--quiet', 'refs/heads/master'], targetDir).ok;
  if (!hasMain && hasMaster) baseBranch = 'master';

  const isBaseBranch = currentBranch === baseBranch;

  // Dirty check
  const statusRes = runCmd('git', ['status', '--porcelain', '-uall'], targetDir);
  const dirtyFiles = statusRes.ok && statusRes.out ? statusRes.out.split('\n').filter(Boolean) : [];
  const isClean = dirtyFiles.length === 0;

  // Unpushed check
  let unpushedCount = 0;
  const unpushedRes = runCmd('git', ['rev-list', '--count', `@{upstream}..HEAD`], targetDir);
  if (unpushedRes.ok && unpushedRes.out) {
    unpushedCount = parseInt(unpushedRes.out, 10) || 0;
  }

  return {
    isGit: true,
    currentBranch,
    baseBranch,
    isBaseBranch,
    isClean,
    dirtyCount: dirtyFiles.length,
    dirtyFiles: dirtyFiles.slice(0, 10),
    unpushedCount,
  };
}

function inspectStalePlans(targetDir, targetIssueNumber) {
  const findings = [];
  const filesToCheck = [
    { name: 'tasks/plan.md', path: path.join(targetDir, 'tasks', 'plan.md') },
    { name: 'CONSTRAINTS.md', path: path.join(targetDir, 'CONSTRAINTS.md') },
    { name: 'tasks/todo.md', path: path.join(targetDir, 'tasks', 'todo.md') },
    { name: 'tasks/pr-body.md', path: path.join(targetDir, 'tasks', 'pr-body.md') },
  ];

  for (const f of filesToCheck) {
    if (fs.existsSync(f.path)) {
      try {
        const content = fs.readFileSync(f.path, 'utf8');
        const issueMatch = content.match(/Issue:\s*#?(\d+)/i) || content.match(/#(\d+)/);
        const recordedIssue = issueMatch ? issueMatch[1] : null;
        if (recordedIssue && targetIssueNumber && String(recordedIssue) !== String(targetIssueNumber)) {
          findings.push({
            file: f.name,
            recordedIssue,
            mismatch: true,
            warning: `Belongs to issue #${recordedIssue}, not current issue #${targetIssueNumber}`,
          });
        } else if (recordedIssue) {
          findings.push({ file: f.name, recordedIssue, mismatch: false });
        }
      } catch {
        // ignore read error
      }
    }
  }

  const hasMismatch = findings.some((f) => f.mismatch);
  return {
    hasStalePlan: hasMismatch,
    details: findings,
  };
}

function fetchIssueData(targetDir, issueNumber) {
  const ghCheck = runCmd('gh', ['--version'], targetDir);
  if (!ghCheck.ok) {
    return { ok: false, error: 'GitHub CLI (gh) is not installed or not in PATH' };
  }

  if (issueNumber) {
    const viewRes = runCmd('gh', [
      'issue', 'view', String(issueNumber),
      '--json', 'number,title,body,labels,assignees,state,comments'
    ], targetDir);

    if (!viewRes.ok) {
      return { ok: false, error: viewRes.err || `Failed to fetch issue #${issueNumber}` };
    }

    try {
      const data = JSON.parse(viewRes.out);
      const labels = (data.labels || []).map((l) => l.name);
      const isQuickFix = labels.includes('quick-fix');
      const hasCodeRabbitPlan = (data.comments || []).some((c) =>
        (c.author && c.author.login === 'coderabbitai') || /coderabbitai/i.test(c.body || '')
      );

      return {
        ok: true,
        mode: 'specific-issue',
        issue: {
          number: data.number,
          title: data.title,
          state: data.state,
          labels,
          isQuickFix,
          hasCodeRabbitPlan,
          assignees: (data.assignees || []).map((a) => a.login),
          bodyLength: (data.body || '').length,
          commentsCount: (data.comments || []).length,
        },
      };
    } catch (e) {
      return { ok: false, error: `JSON parsing error: ${e.message}` };
    }
  }

  // No arguments mode: discover and recommend top 1 open issue
  const listRes = runCmd('gh', [
    'issue', 'list', '--state', 'open', '--limit', '50',
    '--json', 'number,title,labels,updatedAt,comments'
  ], targetDir);

  if (!listRes.ok) {
    return { ok: false, error: listRes.err || 'Failed to list open issues' };
  }

  try {
    const issues = JSON.parse(listRes.out);
    if (!issues.length) {
      return { ok: true, mode: 'discovery', openCount: 0, recommended: null };
    }

    // Rank: unblocker/critical labels first, then quick-fix / small, then updatedAt
    const ranked = issues.slice().sort((a, b) => {
      const aLabels = (a.labels || []).map((l) => l.name.toLowerCase());
      const bLabels = (b.labels || []).map((l) => l.name.toLowerCase());
      const aCrit = aLabels.some((l) => /critical|urgent|blocker|p0|p1/i.test(l));
      const bCrit = bLabels.some((l) => /critical|urgent|blocker|p0|p1/i.test(l));
      if (aCrit && !bCrit) return -1;
      if (!aCrit && bCrit) return 1;
      return a.number - b.number;
    });

    const top = ranked[0];
    return {
      ok: true,
      mode: 'discovery',
      openCount: issues.length,
      recommended: {
        number: top.number,
        title: top.title,
        labels: (top.labels || []).map((l) => l.name),
        rationale: 'Highest priority open issue in the backlog',
      },
      backlog: ranked.slice(0, 5).map((i) => ({
        number: i.number,
        title: i.title,
        labels: (i.labels || []).map((l) => l.name),
      })),
    };
  } catch (e) {
    return { ok: false, error: `JSON parsing error: ${e.message}` };
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    console.log(`Usage: node scripts/issue-intake.js [issue-number] [options]
Options:
  --issue <number>   Specific issue number
  --dir <path>       Target git repository directory (default: current directory)
  --json             Output results as JSON
  --help, -h         Show this help`);
    process.exit(0);
  }

  const git = checkGitState(opts.dir);
  const stack = detectStack(opts.dir);
  const issueResult = fetchIssueData(opts.dir, opts.issue);
  const activeIssue = opts.issue || (issueResult.ok && issueResult.recommended ? issueResult.recommended.number : null);
  const plans = inspectStalePlans(opts.dir, activeIssue);

  const report = {
    timestamp: new Date().toISOString(),
    dir: opts.dir,
    git,
    stack,
    issue: issueResult,
    plans,
    readyToBranch: git.isGit && git.isClean && git.isBaseBranch,
    routingAdvice: null,
  };

  if (!git.isClean) {
    report.routingAdvice = 'Tree is dirty — route to pipeline-triage before branching or claiming';
  } else if (!git.isBaseBranch) {
    report.routingAdvice = `Currently on feature branch "${git.currentBranch}" — route to pipeline-triage or switch to ${git.baseBranch}`;
  } else if (plans.hasStalePlan) {
    report.routingAdvice = 'Stale plan files detected from a previous issue — replace tasks/plan.md and CONSTRAINTS.md fresh';
  } else {
    report.routingAdvice = 'Ready for Station II planning protocol (Step 0 / Step 0B branch)';
  }

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  // Human-readable CLI summary
  console.log(`\n📋 Issue Intake Report (Station II pre-flight)`);
  console.log(`Directory:   ${opts.dir}`);
  console.log(`Git Status:  ${git.isClean ? '🟢 Clean' : '🔴 Dirty (' + git.dirtyCount + ' files)'} | Branch: ${git.currentBranch} (Base: ${git.baseBranch})`);
  console.log(`Tech Stack:  ${stack.languages.join(', ') || 'unknown'} | Test Runner: ${stack.testRunner || 'none detected'}`);

  if (issueResult.ok && issueResult.issue) {
    const iss = issueResult.issue;
    console.log(`Issue:       #${iss.number} — "${iss.title}" [${iss.labels.join(', ') || 'no labels'}]`);
    console.log(`CodeRabbit:  ${iss.hasCodeRabbitPlan ? '💡 Plan comment detected' : 'None'}`);
    console.log(`Quick-Fix:   ${iss.isQuickFix ? '⚡ Candidate for Step 0C quick-fix lane' : 'No'}`);
  } else if (issueResult.ok && issueResult.recommended) {
    console.log(`Discovery:   Recommended issue #${issueResult.recommended.number}: "${issueResult.recommended.title}" (${issueResult.openCount} open total)`);
  } else {
    console.log(`Issue Fetch: ⚠️ ${issueResult.error || 'No issue data'}`);
  }

  if (plans.hasStalePlan) {
    console.log(`⚠️  Stale Plan Warning:`);
    for (const d of plans.details) {
      if (d.mismatch) console.log(`   - ${d.file}: ${d.warning}`);
    }
  }

  console.log(`Action:      👉 ${report.routingAdvice}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  detectStack,
  checkGitState,
  inspectStalePlans,
  fetchIssueData,
};
