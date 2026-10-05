#!/usr/bin/env node
// Re-read every PR this loop created from the remote and fail loudly on any
// mismatch between what was intended and what GitHub actually holds.
//
// Why this exists: in a real run, two PRs were opened and then had their
// titles silently clobbered to the literal string "@coderabbitai" by a stray
// CLI invocation. Nothing errored. The loop's notes still read "PR opened with
// body X", and the run was reported as delivered. The loop had checked the
// *name* of the thing it created, never its value. This gate closes that gap:
// intent is written down at creation time, then read back from GitHub and
// compared field by field. Mismatch is a hard failure, never a warning.
//
// Usage:
//   node scripts/verify-delivered-prs.js [options]
//
//   --manifest <path>   Delivery manifest (default: loop-delivery.json)
//   --repo <OWNER/NAME> Override repo (default: manifest "repo")
//   --gh-bin <cmd>      gh executable (default: gh)
//   --git-bin <cmd>     git executable (default: git)
//   --remote <name>     git remote for tag lookup (default: origin)
//
// Manifest shape:
//   { "repo": "OWNER/NAME", "prs": [ { "iteration": 1, "number": 60,
//       "branch": "...", "title": "...", "headSha": "dc76409", "tag": "..." } ] }
//
// Exit codes: 0 every PR matches; 1 any mismatch, or a PR that cannot be read.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').slice(0, 22).join('\n'));
  process.exit(0);
}

const MANIFEST_FIELDS = ['number', 'branch', 'title', 'headSha'];

function parseArgs(argv) {
  const out = { manifest: 'loop-delivery.json', ghBin: 'gh', gitBin: 'git', remote: 'origin' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--manifest') out.manifest = argv[++i];
    else if (a === '--repo') out.repo = argv[++i];
    else if (a === '--gh-bin') out.ghBin = argv[++i];
    else if (a === '--git-bin') out.gitBin = argv[++i];
    else if (a === '--remote') out.remote = argv[++i];
    else throw new Error(`unknown argument: ${a}`);
  }
  return out;
}

function run(cmd, argv) {
  try {
    return { ok: true, out: execFileSync(...resolveInvocation(cmd, argv)) };
  } catch (err) {
    // A command that cannot run is a FAILURE, never a silent skip. Swallowing
    // this is how "verified" gets printed for a PR that does not exist.
    const detail = [err.stderr, err.stdout, err.message].filter(Boolean).join(' | ').trim();
    return { ok: false, out: '', err: detail };
  }
}

/**
 * Resolve how to spawn a tool. Three shapes are supported, chosen by the
 * value passed to --gh-bin / --git-bin:
 *
 *   - a plain executable            -> spawned directly
 *   - a .js/.mjs/.cjs script path  -> spawned with this Node binary, so a
 *     caller can inject a stub without relying on shell quoting or PATHEXT
 *   - anything else                 -> spawned directly, letting the OS report
 *     a clear error if it cannot run
 *
 * .cmd/.bat is deliberately NOT special-cased: Node cannot spawn one without
 * a shell, and routing through ComSpec means quoting the command line, which
 * is its own source of silent breakage. Use a .js stub instead.
 */
function resolveInvocation(cmd, argv) {
  if (/\.(js|mjs|cjs)$/i.test(cmd)) {
    return [process.execPath, [cmd, ...argv], { encoding: 'utf8' }];
  }
  return [cmd, argv, { encoding: 'utf8' }];
}

/** Read one PR from the remote. Returns { ok, pr } or { ok:false, err }. */
function fetchPr(ghBin, repo, number) {
  const argv = ['pr', 'view', String(number), '--json', 'number,title,body,headRefName,headRefOid,state,isDraft'];
  if (repo) argv.push('--repo', repo);
  const r = run(ghBin, argv);
  if (!r.ok) return { ok: false, err: `gh pr view ${number} failed: ${r.err}` };
  try {
    return { ok: true, pr: JSON.parse(r.out) };
  } catch (err) {
    return { ok: false, err: `gh pr view ${number} returned unparseable JSON: ${r.err || out(r.out)}` };
  }
}

const out = (s) => (s === undefined ? '' : s);

function tagExists(gitBin, remote, tag) {
  const r = run(gitBin, ['ls-remote', '--tags', remote, `refs/tags/${tag}`]);
  if (!r.ok) return { ok: false, err: `git ls-remote failed: ${r.err}` };
  const line = r.out.trim();
  return line
    ? { ok: true, sha: line.split(/\s+/)[0] }
    : { ok: false, err: `tag ${tag} not found on ${remote}` };
}

// --- load manifest ----------------------------------------------------------

let manifest;
try {
  manifest = JSON.parse(readFileSync(args.manifest, 'utf8'));
} catch (err) {
  console.error(`FAIL: cannot read delivery manifest ${args.manifest}: ${err.message}`);
  console.error('No PR can be verified without it. Write one entry per created PR (see header comment).');
  process.exit(1);
}

const prs = Array.isArray(manifest.prs) ? manifest.prs : [];
if (prs.length === 0) {
  console.error(`FAIL: ${args.manifest} lists no PRs. Nothing was verified — this is not a pass.`);
  process.exit(1);
}

const repo = args.repo || manifest.repo || null;
const results = [];

for (const entry of prs) {
  const label = entry.number ? `PR #${entry.number}` : `iteration ${entry.iteration ?? '?'}`;
  const checks = [];

  const missing = MANIFEST_FIELDS.filter((f) => !entry[f]);
  if (missing.length) {
    checks.push({ name: 'manifest entry complete', ok: false, expected: MANIFEST_FIELDS.join(', '), actual: `missing ${missing.join(', ')}` });
  }

  if (entry.number) {
    const got = fetchPr(args.ghBin, repo, entry.number);
    if (!got.ok) {
      checks.push({ name: 'PR readable from remote', ok: false, expected: 'readable', actual: got.err });
    } else {
      const pr = got.pr;
      checks.push({ name: 'number', ok: pr.number === entry.number, expected: String(entry.number), actual: String(pr.number) });
      checks.push({ name: 'title', ok: pr.title === entry.title, expected: entry.title, actual: pr.title });
      checks.push({ name: 'head branch', ok: pr.headRefName === entry.branch, expected: entry.branch, actual: pr.headRefName });
      checks.push({
        name: 'head SHA',
        ok: typeof pr.headRefOid === 'string' && pr.headRefOid.startsWith(String(entry.headSha)),
        expected: `${entry.headSha}…`,
        actual: pr.headRefOid,
      });
      const body = pr.body || '';
      checks.push({ name: 'body non-empty', ok: body.trim().length > 0, expected: '> 0 chars', actual: `${body.trim().length} chars` });
      checks.push({
        name: 'body names its branch',
        ok: body.includes(entry.branch),
        expected: `contains "${entry.branch}"`,
        actual: body.includes(entry.branch) ? 'present' : 'absent',
      });
      checks.push({ name: 'state', ok: pr.state === 'OPEN', expected: 'OPEN', actual: pr.state });
      checks.push({ name: 'not a draft', ok: pr.isDraft === false, expected: 'false', actual: String(pr.isDraft) });
    }
  }

  if (entry.tag) {
    const t = tagExists(args.gitBin, args.remote, entry.tag);
    checks.push({ name: 'checkpoint tag', ok: t.ok, expected: `${entry.tag} on ${args.remote}`, actual: t.ok ? `${t.sha.slice(0, 7)}…` : t.err });
  }

  results.push({ label, checks });
}

// --- report ----------------------------------------------------------------

let failed = 0;
for (const { label, checks } of results) {
  console.log(`\n${label}`);
  for (const c of checks) {
    if (c.ok) {
      console.log(`  PASS  ${c.name}`);
    } else {
      failed++;
      console.log(`  FAIL  ${c.name}`);
      console.log(`          expected: ${c.expected}`);
      console.log(`          actual:   ${c.actual}`);
    }
  }
}

const total = results.reduce((n, r) => n + r.checks.length, 0);
console.log(`\n${total - failed}/${total} checks passed across ${results.length} PR(s)`);

if (failed > 0) {
  console.error(`\nFAIL: ${failed} check(s) did not match. The remote does not hold what this loop intended.`);
  console.error('Do NOT record these iterations as delivered. Fix the PR (or re-open it), then re-run this gate.');
  process.exit(1);
}

console.log('OK: every created PR matches what the loop intended.');
process.exit(0);
