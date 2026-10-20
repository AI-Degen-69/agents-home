#!/usr/bin/env node

/**
 * parallel-safe-check.js
 * Scans git worktrees and open GitHub issues to detect file intersections
 * and determine parallel-safe candidate issues.
 * Zero external dependencies (uses built-in child_process).
 */

const { execSync } = require('child_process');

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

function parseRelevantFiles(issueBody) {
  if (!issueBody) return [];
  const files = new Set();
  const lines = issueBody.split('\n');
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#+\s+(Relevant files|Files touched|Scope)/i.test(trimmed)) {
      inSection = true;
      continue;
    }
    if (inSection && /^#+\s+/.test(trimmed)) {
      // A second target heading (Scope <-> Relevant files) continues the
      // section instead of closing it — both sections feed conflict detection
      // per skills/i-pick-issue/SKILL.md lines 80-99.
      if (/^#+\s+(Relevant files|Files touched|Scope)/i.test(trimmed)) {
        continue;
      }
      break;
    }
    if (inSection) {
      // Prefer the backticked file path over the bullet's first word:
      // `- Update `src/app.js`` yields src/app.js, not "Update".
      const backticked = trimmed.match(/`([^`]+)`/);
      if (backticked && /[/.]/.test(backticked[1])) {
        files.add(backticked[1]);
        continue;
      }
      const match = trimmed.match(/^[-*]\s+`?([^`\s]+)`?/);
      if (match && /[/.]/.test(match[1])) {
        files.add(match[1]);
      }
    }
  }
  return Array.from(files);
}

function getWorktrees() {
  const output = runCmd('git worktree list --porcelain');
  if (!output) return [];
  const trees = [];
  let current = {};
  for (const line of output.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current.path) trees.push(current);
      current = { path: line.substring(9).trim() };
    } else if (line.startsWith('branch ')) {
      current.branch = line.substring(7).trim();
    }
  }
  if (current.path) trees.push(current);
  return trees;
}

function getOpenIssues() {
  const jsonStr = runCmd('gh issue list --state open --limit 50 --json number,title,body');
  if (!jsonStr) return [];
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return [];
  }
}

function main() {
  const isJson = process.argv.includes('--json');
  const worktrees = getWorktrees();
  const issues = getOpenIssues();

  if (issues.length === 0) {
    if (isJson) {
      console.log(JSON.stringify({ error: 'No open issues found or gh CLI not available' }));
    } else {
      console.log('No open issues found or gh CLI not available.');
    }
    return;
  }

  // Active worktree branches that correspond to issue numbers
  const inFlightIssues = new Map();
  for (const wt of worktrees) {
    if (!wt.branch) continue;
    const match = wt.branch.match(/issue[/-](\d+)|#?(\d+)/i);
    if (match) {
      const num = parseInt(match[1] || match[2], 10);
      inFlightIssues.set(num, wt);
    }
  }

  const activeFootprint = new Set();
  const candidates = [];

  for (const issue of issues) {
    const files = parseRelevantFiles(issue.body);
    const isInFlight = inFlightIssues.has(issue.number);

    if (isInFlight) {
      files.forEach(f => activeFootprint.add(f));
    }

    candidates.push({
      number: issue.number,
      title: issue.title,
      files,
      isInFlight,
    });
  }

  const report = candidates.map(cand => {
    if (cand.isInFlight) {
      return {
        ...cand,
        status: 'IN_FLIGHT',
        conflicts: [],
      };
    }

    const conflicts = cand.files.filter(f => activeFootprint.has(f));
    return {
      ...cand,
      status: conflicts.length > 0 ? 'CONFLICT' : 'PARALLEL_SAFE',
      conflicts,
    };
  });

  if (isJson) {
    console.log(JSON.stringify({ activeWorktrees: worktrees.length, report }, null, 2));
    return;
  }

  console.log(`\n=== Parallel-Safe Candidate Audit ===`);
  console.log(`Active Worktrees: ${worktrees.length}`);
  console.log(`Active Footprint Files: ${activeFootprint.size}`);
  console.log(`-------------------------------------`);

  for (const item of report) {
    if (item.status === 'IN_FLIGHT') {
      console.log(`[IN FLIGHT]     #${item.number}: ${item.title}`);
    } else if (item.status === 'CONFLICT') {
      console.log(`[CONFLICT]      #${item.number}: ${item.title}`);
      console.log(`                Shared files: ${item.conflicts.join(', ')}`);
    } else {
      console.log(`[PARALLEL SAFE] #${item.number}: ${item.title} (${item.files.length} files)`);
    }
  }
  console.log(`-------------------------------------\n`);
}

if (require.main === module) {
  main();
}
