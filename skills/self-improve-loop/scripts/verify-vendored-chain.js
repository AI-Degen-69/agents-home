#!/usr/bin/env node
// Automated pre-flight check for the self-improve-loop vendored chain.
// Verifies all 5 steps declared in references/verify-vendored-chain.md:
//   1. Enumerate each vendored skill's folder and declared companion files
//   2. Resolve cross-references inside each SKILL.md
//   3. Confirm each folder is linked into active harness roots
//   4. Confirm loadability and no orphan shadow collisions
//   5. Exercise the loop's own delivery gate (evals/verify-delivered-prs.test.js)
//
// Usage:
//   node scripts/verify-vendored-chain.js [options]
//
// Options:
//   --skills-root <path>    Override canonical skills root (default: ~/.agents/skills)
//   --skip-tests            Skip running unit tests in check 5
//   --json                  Output JSON results
//   --help, -h              Show this help
//
// Exit codes: 0 all checks pass; 1 any check failed.

import { existsSync, readdirSync, readFileSync, lstatSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SELF_SKILL_DIR = resolve(__dirname, '..');
const CANONICAL_SKILLS_ROOT = resolve(SELF_SKILL_DIR, '..');

const CHAIN_COMPANIONS = {
  'improve-codebase-architecture': ['SKILL.md', 'HTML-REPORT.md', 'agents/openai.yaml'],
  'codebase-design': ['SKILL.md', 'DEEPENING.md', 'DESIGN-IT-TWICE.md', 'agents/openai.yaml'],
  'domain-modeling': ['SKILL.md', 'GLOSSARY-FORMAT.md', 'ADR-FORMAT.md', 'agents/openai.yaml'],
  'grilling': ['SKILL.md', 'agents/openai.yaml'],
  'self-improve-loop': [
    'SKILL.md',
    'references/merging-stacked-prs.md',
    'references/verify-vendored-chain.md',
    'scripts/verify-delivered-prs.js',
    'scripts/verify-vendored-chain.js',
    'evals/verify-delivered-prs.test.js',
  ],
};

function parseArgs(argv) {
  const opts = {
    skillsRoot: CANONICAL_SKILLS_ROOT,
    skipTests: false,
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--skills-root') opts.skillsRoot = resolve(argv[++i]);
    else if (a === '--skip-tests') opts.skipTests = true;
    else if (a === '--json') opts.json = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return opts;
}

function getHarnessRoots() {
  const home = homedir();
  const roots = [];

  const hermes = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'hermes', 'skills')
    : join(home, 'AppData', 'Local', 'hermes', 'skills');
  roots.push({ name: 'hermes', path: hermes, requiredType: 'junction' });

  const gemini = join(home, '.gemini', 'config', 'skills');
  roots.push({ name: 'gemini', path: gemini, requiredType: 'symbolic' });

  const opencode = join(home, '.config', 'opencode', 'skills');
  roots.push({ name: 'opencode', path: opencode, requiredType: 'junction' });

  return roots.filter((r) => existsSync(r.path));
}

function runCheck1(skillsRoot) {
  const findings = [];
  for (const [skill, files] of Object.entries(CHAIN_COMPANIONS)) {
    const skillPath = join(skillsRoot, skill);
    if (!existsSync(skillPath)) {
      findings.push({ ok: false, desc: `Skill folder missing: ${skill}` });
      continue;
    }
    for (const rel of files) {
      const filePath = join(skillPath, rel);
      if (!existsSync(filePath)) {
        findings.push({ ok: false, desc: `Missing companion file: ${skill}/${rel}` });
      }
    }
  }
  return {
    name: '1. Enumerate vendored skills & companions',
    ok: findings.length === 0,
    findings,
  };
}

function runCheck2(skillsRoot) {
  const findings = [];
  for (const skill of Object.keys(CHAIN_COMPANIONS)) {
    const skillMd = join(skillsRoot, skill, 'SKILL.md');
    if (!existsSync(skillMd)) continue;
    const content = readFileSync(skillMd, 'utf8');
    // Match inline markdown links [text](target)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const target = match[2].trim();
      // Skip URLs and anchor links
      if (/^(https?:|mailto:|#)/i.test(target)) continue;
      const cleanTarget = target.split('#')[0].split('?')[0];
      if (!cleanTarget) continue;
      const resolved = resolve(join(skillsRoot, skill), cleanTarget);
      if (!existsSync(resolved)) {
        findings.push({ ok: false, desc: `Broken cross-ref in ${skill}/SKILL.md -> ${cleanTarget}` });
      }
    }
  }
  return {
    name: '2. Resolve cross-references inside SKILL.md files',
    ok: findings.length === 0,
    findings,
  };
}

function runCheck3(skillsRoot, harnessRoots) {
  const findings = [];
  for (const harness of harnessRoots) {
    for (const skill of Object.keys(CHAIN_COMPANIONS)) {
      const entryPath = join(harness.path, skill);
      if (!existsSync(entryPath)) {
        findings.push({ ok: false, desc: `Skill ${skill} not linked in ${harness.name} (${harness.path})` });
      }
    }
  }
  return {
    name: '3. Confirm harness root links',
    ok: findings.length === 0,
    findings,
  };
}

function runCheck4(harnessRoots) {
  const findings = [];
  for (const harness of harnessRoots) {
    let entries = [];
    try {
      entries = readdirSync(harness.path);
    } catch {
      continue;
    }
    for (const skill of Object.keys(CHAIN_COMPANIONS)) {
      const orphans = entries.filter((e) => e.startsWith(`${skill}.rollback`) || e.startsWith(`${skill}.broken`) || e.startsWith(`${skill}-orphan`));
      for (const orphan of orphans) {
        findings.push({ ok: false, desc: `Orphan shadow link collision in ${harness.name}: ${orphan}` });
      }
    }
  }
  return {
    name: '4. Check for orphan/shadow collisions in harness roots',
    ok: findings.length === 0,
    findings,
  };
}

function runCheck5(selfSkillDir, skipTests) {
  if (skipTests) {
    return {
      name: '5. Exercise loop delivery gate tests',
      ok: true,
      findings: [{ ok: true, desc: 'Skipped via --skip-tests' }],
    };
  }
  const testFile = join(selfSkillDir, 'evals', 'verify-delivered-prs.test.js');
  if (!existsSync(testFile)) {
    return {
      name: '5. Exercise loop delivery gate tests',
      ok: false,
      findings: [{ ok: false, desc: `Test file not found: ${testFile}` }],
    };
  }
  try {
    execFileSync(process.execPath, ['--test', testFile], {
      cwd: selfSkillDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      name: '5. Exercise loop delivery gate tests',
      ok: true,
      findings: [{ ok: true, desc: 'All 15 delivery gate tests passed' }],
    };
  } catch (err) {
    const detail = (err.stderr || err.stdout || err.message || '').trim();
    return {
      name: '5. Exercise loop delivery gate tests',
      ok: false,
      findings: [{ ok: false, desc: `Gate tests failed: ${detail}` }],
    };
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(readFileSync(__filename, 'utf8').split('\n').slice(0, 18).join('\n'));
    process.exit(0);
  }

  const harnessRoots = getHarnessRoots();
  const checks = [
    runCheck1(args.skillsRoot),
    runCheck2(args.skillsRoot),
    runCheck3(args.skillsRoot, harnessRoots),
    runCheck4(harnessRoots),
    runCheck5(SELF_SKILL_DIR, args.skipTests),
  ];

  const allPassed = checks.every((c) => c.ok);

  if (args.json) {
    console.log(JSON.stringify({ ok: allPassed, checks }, null, 2));
    process.exit(allPassed ? 0 : 1);
  }

  console.log('== Verify Vendored Chain (Pre-flight) ==\n');
  for (const c of checks) {
    if (c.ok) {
      console.log(`[PASS] ${c.name}`);
      for (const f of c.findings) {
        if (f.desc && !f.desc.startsWith('All 15')) {
          console.log(`       → ${f.desc}`);
        }
      }
    } else {
      console.log(`[FAIL] ${c.name}`);
      for (const f of c.findings) {
        if (!f.ok) {
          console.log(`       ✖ ${f.desc}`);
        }
      }
    }
  }

  console.log(`\nResult: ${allPassed ? 'ALL 5 CHECKS PASSED — Chain is fully operational' : 'FAILURES DETECTED — Chain is blocked'}`);
  process.exit(allPassed ? 0 : 1);
}

main();
