#!/usr/bin/env node
// Automated forensic triage data collector for model-routed-triage.
// Gathers live repository state across branches, worktrees, stashes, PRs, and issues
// in a single pass, calculating branch divergence and ancestry relative to main.
//
// Usage:
//   node scripts/repo-triage.js [options]
//
// Options:
//   --dir <path>       Target git repository directory (default: current directory)
//   --base <branch>    Base branch to compare against (default: main)
//   --json             Output results as JSON
//   --help, -h         Show this help
//
// Exit codes: 0 success; 1 fatal git error.

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

function parseArgs(argv) {
  const opts = {
    dir: process.cwd(),
    base: 'main',
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--dir') opts.dir = resolve(argv[++i]);
    else if (a === '--base') opts.base = argv[++i];
    else if (a === '--json') opts.json = true;
    else throw new Error(`Unknown argument: ${a}`);
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

function collectTriageData(cwd, base) {
  // 1. Status & Dirty tree
  const statusRes = runCmd('git', ['status', '--porcelain', '-uall'], cwd);
  const dirtyFiles = statusRes.ok && statusRes.out ? statusRes.out.split('\n').filter(Boolean) : [];

  // 2. Worktrees
  const wtRes = runCmd('git', ['worktree', 'list', '--porcelain'], cwd);
  const worktrees = [];
  if (wtRes.ok && wtRes.out) {
    let current = {};
    for (const line of wtRes.out.split('\n')) {
      if (line.startsWith('worktree ')) current.path = line.replace('worktree ', '').trim();
      else if (line.startsWith('HEAD ')) current.head = line.replace('HEAD ', '').trim();
      else if (line.startsWith('branch ')) current.branch = line.replace('branch ', '').replace('refs/heads/', '').trim();
      else if (line === '') {
        if (current.path) worktrees.push(current);
        current = {};
      }
    }
    if (current.path) worktrees.push(current);
  }

  // 3. Branches
  const brRes = runCmd('git', ['for-each-ref', '--format=%(refname:short)|%(upstream:short)|%(objectname:short)|%(subject)', 'refs/heads/'], cwd);
  const branches = [];
  if (brRes.ok && brRes.out) {
    for (const line of brRes.out.split('\n').filter(Boolean)) {
      const [name, upstream, sha, subject] = line.split('|');
      const isBase = name === base;
      let behind = 0;
      let ahead = 0;
      let isAncestor = false;
      let diffStat = '';

      if (!isBase) {
        const divRes = runCmd('git', ['rev-list', '--left-right', '--count', `${base}...${name}`], cwd);
        if (divRes.ok && divRes.out) {
          const parts = divRes.out.split(/\s+/);
          behind = parseInt(parts[0], 10) || 0;
          ahead = parseInt(parts[1], 10) || 0;
        }

        const ancRes = runCmd('git', ['merge-base', '--is-ancestor', name, base], cwd);
        isAncestor = ancRes.ok;

        const diffRes = runCmd('git', ['diff', `${base}...${name}`, '--shortstat'], cwd);
        if (diffRes.ok) diffStat = diffRes.out;
      }

      branches.push({
        name,
        upstream: upstream || null,
        sha,
        subject,
        isBase,
        behind,
        ahead,
        isAncestor,
        diffStat,
      });
    }
  }

  // 4. Stashes
  const stashRes = runCmd('git', ['stash', 'list'], cwd);
  const stashes = [];
  if (stashRes.ok && stashRes.out) {
    for (const line of stashRes.out.split('\n').filter(Boolean)) {
      const idMatch = line.match(/^(stash@\{(\d+)\}):\s*(.*)$/);
      if (idMatch) {
        const id = idMatch[1];
        const desc = idMatch[3];
        const statRes = runCmd('git', ['stash', 'show', '--stat', id], cwd);
        stashes.push({ id, desc, stat: statRes.ok ? statRes.out : '' });
      }
    }
  }

  // 5. GitHub PRs & Issues (optional / non-fatal)
  let prs = [];
  const ghPrRes = runCmd('gh', ['pr', 'list', '--state', 'open', '--json', 'number,title,headRefName,isDraft,author'], cwd);
  if (ghPrRes.ok && ghPrRes.out) {
    try {
      prs = JSON.parse(ghPrRes.out);
    } catch {}
  }

  let issues = [];
  const ghIssueRes = runCmd('gh', ['issue', 'list', '--state', 'open', '--json', 'number,title,author,labels'], cwd);
  if (ghIssueRes.ok && ghIssueRes.out) {
    try {
      issues = JSON.parse(ghIssueRes.out);
    } catch {}
  }

  return {
    base,
    dirtyFiles,
    worktrees,
    branches,
    stashes,
    prs,
    issues,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(readFileSync(__filename, 'utf8').split('\n').slice(0, 18).join('\n'));
    process.exit(0);
  }

  const checkGit = runCmd('git', ['rev-parse', '--is-inside-work-tree'], args.dir);
  if (!checkGit.ok) {
    console.error(`FAIL: ${args.dir} is not a valid git repository.`);
    process.exit(1);
  }

  const data = collectTriageData(args.dir, args.base);

  if (args.json) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }

  console.log(`== Forensic Repository Triage (Base: ${data.base}) ==\n`);

  console.log(`-- Working Tree Status --`);
  if (data.dirtyFiles.length === 0) {
    console.log(`Clean (0 modified/untracked files)\n`);
  } else {
    console.log(`${data.dirtyFiles.length} uncommitted file(s):`);
    for (const f of data.dirtyFiles.slice(0, 5)) console.log(`  ${f}`);
    if (data.dirtyFiles.length > 5) console.log(`  ... and ${data.dirtyFiles.length - 5} more\n`);
    else console.log('');
  }

  console.log(`-- Branches (${data.branches.length}) --`);
  for (const b of data.branches) {
    if (b.isBase) {
      console.log(`* [BASE] ${b.name} (${b.sha.slice(0, 7)}) ${b.subject}`);
    } else {
      const status = b.isAncestor
        ? 'SUPERSEDED (ancestor of base)'
        : b.ahead === 0
        ? 'BEHIND (no unique commits)'
        : `ACTIVE (+${b.ahead}/-${b.behind})`;
      console.log(`  ${b.name.padEnd(28)} | ${status.padEnd(30)} | ${b.diffStat || 'no diff'}`);
    }
  }
  console.log('');

  console.log(`-- Worktrees (${data.worktrees.length}) --`);
  for (const w of data.worktrees) {
    console.log(`  ${w.branch || 'detached'} -> ${w.path}`);
  }
  console.log('');

  console.log(`-- Stashes (${data.stashes.length}) --`);
  for (const s of data.stashes) {
    console.log(`  ${s.id}: ${s.desc}`);
  }
  console.log('');

  console.log(`-- Open GitHub PRs (${data.prs.length}) & Issues (${data.issues.length}) --`);
  for (const p of data.prs) {
    console.log(`  PR #${p.number}: ${p.title} (${p.headRefName})`);
  }
  for (const i of data.issues) {
    console.log(`  Issue #${i.number}: ${i.title}`);
  }
}

main();
