#!/usr/bin/env node
// Diff live OpenCode model IDs against references/models.md.
// Usage: node scripts/models-sync.mjs [--check]
//   --check  exit 1 when the inventory drifted (for CI or a pre-commit hook)
//   --self-test  run the diff assertions
// Zero dependencies. Node >= 18. Reads only; never edits the markdown.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MODELS = path.resolve(HERE, '..', 'references', 'models.md');
const ID = /`([a-z0-9][a-z0-9.-]*\/[a-z0-9][a-z0-9.:~_-]*)`/g;
// Providers summarized by category instead of one row per ID, plus surfaces the
// operator deleted from routing. Drift there is not actionable.
const SUMMARY = new Set(['openrouter', 'google', 'freellmapi', 'sail-heshbon-zevel']);
// Model IDs the operator reviewed and dropped on purpose. Still live on the
// provider, never routed. A new ID still shows up as drift.
const DROPPED = new Set([
  'opencode/flint-40b-free',
  'opencode/iceman-free',
  'sail-ai-degen/glm-5.3-flex',
  'sail-ai-degen/kimi-k3',
  'inception/mercury-2.5',
  'inception/mercury-2',
  'inception/mercury-edit-2',
  'openrouter/nvidia/nemotron-3.5-lightning:free',
  'openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
]);

function live() {
  const out = execSync('opencode models', { encoding: 'utf8' });
  return out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function listed(markdown) {
  const ids = new Set();
  for (const m of markdown.matchAll(ID)) ids.add(m[1]);
  return [...ids];
}

function diff(liveIds, listedIds) {
  const l = new Set(liveIds);
  const s = new Set(listedIds);
  return {
    unlisted: liveIds.filter((id) => !s.has(id)),
    gone: listedIds.filter((id) => !l.has(id)),
  };
}

function selfTest() {
  const d = diff(['a/x', 'a/y'], ['a/y', 'a/z']);
  if (d.unlisted.join() !== 'a/x') throw new Error('unlisted failed: ' + d.unlisted);
  if (d.gone.join() !== 'a/z') throw new Error('gone failed: ' + d.gone);
  const ids = listed('`a/x` and `b/c:free` and `not-a-model`');
  if (ids.length !== 2) throw new Error('parse failed: ' + ids);
  console.log('self-test ok');
}

if (process.argv.includes('--self-test')) {
  selfTest();
  process.exit(0);
}

const liveIds = live();
const listedIds = listed(fs.readFileSync(MODELS, 'utf8'));
const checked = liveIds.filter((id) => !SUMMARY.has(id.split('/')[0]) && !DROPPED.has(id));
const { unlisted, gone } = diff(checked, listedIds);

console.log(`live ${liveIds.length} / checked ${checked.length} / listed ${listedIds.length}`);
if (unlisted.length) console.log(`\nLIVE BUT NOT LISTED (${unlisted.length})\n` + unlisted.join('\n'));
if (gone.length) console.log(`\nLISTED BUT GONE (${gone.length})\n` + gone.join('\n'));
if (!unlisted.length && !gone.length) console.log('inventory in sync');
if (process.argv.includes('--check') && (unlisted.length || gone.length)) process.exit(1);
