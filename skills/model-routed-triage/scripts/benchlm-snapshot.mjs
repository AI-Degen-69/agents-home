#!/usr/bin/env node
// BenchLM per-model snapshot for model-routed-triage (see handbook §9.1).
// Pulls BenchAlign ranks, board scores and prices for the skill's models,
// 3 reads per model on the Free plan (250/month, 30 req/min).
//
// Usage:
//   node scripts/benchlm-snapshot.mjs --skill
//   node scripts/benchlm-snapshot.mjs --models mercury-3,mimo-v2-6-flash
//   node scripts/benchlm-snapshot.mjs --usage
//   node scripts/benchlm-snapshot.mjs --self-test
//
// Env: BENCHLM_DATA_KEY (required except for --self-test).
// Options: --out <dir> (default: <tmp>/benchlm-snapshot), --json (stdout JSON).
// Exit codes: 0 success; 1 config/network error.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://data.benchlm.ai/v1';

// Falls back to <skill>/.env (gitignored) so the key survives a fresh shell.
function loadDotEnv() {
  if (process.env.BENCHLM_DATA_KEY) return;
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
  let text;
  try {
    text = readFileSync(envPath, 'utf8');
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

// Skill ID -> BenchLM modelKey. null = BenchLM has no entry for that model.
// Variants that share weights map to the base key; the note says so out loud.
export const IDENTITY = [
  { id: 'M1', key: 'gemini-3-8-flash' },
  { id: 'M2', key: 'claude-opus-5-5' },
  { id: 'M3', key: 'claude-sonnet-5-5' },
  { id: 'OC-1', key: 'reflection-beam' },
  { id: 'OC-2', key: null, note: 'Big Pickle: absent from BenchLM catalog' },
  { id: 'OC-3', key: null, note: 'V4.1 base build absent; only the 1017 refresh is listed (FB-11)' },
  { id: 'OC-4', key: 'glm-5-3-flash' },
  { id: 'OC-5', key: null, note: 'LongCat 2.5 Preview: absent (only LongCat-2.0)' },
  { id: 'OC-6', key: 'mimo-v2-6-flash' },
  { id: 'OC-7', key: 'nemotron-3-ultra-500b' },
  { id: 'OC-8', key: 'nemotron-3-5-lightning-30b-a3b-nvfp4' },
  { id: 'OC-9', key: 'nemotron-3-5-super-vl-120b-a12b' },
  { id: 'OC-10', key: 'mercury-3' },
  { id: 'CL-1', key: null, note: 'Solar Mini 4: absent from BenchLM catalog' },
  { id: 'CL-2', key: 'mimo-v2-6-flash' },
  { id: 'CL-3', key: 'nemotron-3-5-super-vl-120b-a12b' },
  { id: 'CL-4', key: 'mercury-3' },
  { id: 'FB-1', key: 'mimo-v2-6-flash' },
  { id: 'FB-2', key: 'mimo-v2-6-flash', note: 'Fast serving variant: score is the base model' },
  { id: 'FB-3', key: 'mimo-v2-6-pro' },
  { id: 'FB-4', key: null, note: 'V4.1 base build absent; only the 1017 refresh is listed' },
  { id: 'FB-5', key: null, note: 'V4.1 base build absent; only the 1017 refresh is listed' },
  { id: 'FB-6', key: 'muse-spark-1-3' },
  { id: 'FB-7', key: 'glm-5-3-flash' },
  { id: 'FB-8', key: 'gpt-6-luna' },
  { id: 'FB-9', key: 'claude-haiku-5-5', note: 'BenchLM lists the 1M-context build; FB-9 is 100k' },
  { id: 'FB-10', key: 'gemini-4-argon' },
  { id: 'FB-11', key: 'deepseek-v4-1-flash' },
  { id: 'FB-12', key: 'mercury-3' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, key) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 404) return null; // no BenchAlign ranking / no rows
  if (!res.ok) {
    const code = body?.error?.code ?? res.status;
    throw new Error(`${path}: ${code} ${body?.error?.message ?? ''}`.trim());
  }
  return body;
}

// Flattens the three pages into the row the routing table needs.
export function summarize(key, { rankings, results, pricing }) {
  const pick = (surface) => (rankings?.rankings ?? []).find((r) => r.surface === surface);
  const overall = pick('overall');
  const boards = results?.items?.length ?? 0;
  const p = pricing?.items?.[0];
  return {
    key,
    name: rankings?.model?.name ?? pricing?.items?.[0]?.name ?? results?.items?.[0]?.modelName ?? key,
    overall: overall?.score ?? null,
    rank: overall?.rank ?? null,
    coding: pick('coding')?.score ?? null,
    agentic: pick('agentic')?.score ?? null,
    knowledge: pick('knowledge')?.score ?? null,
    evidence: overall?.evidenceStatus ?? null,
    maturity: overall?.maturity ?? null,
    interval: overall ? `${overall.scoreInterval90Lower}-${overall.scoreInterval90Upper}` : null,
    boards,
    priceIn: p?.current?.input ?? null,
    priceOut: p?.current?.output ?? null,
    priceSince: p?.current?.since ?? null,
  };
}

function fmt(row) {
  const v = (x) => (x === null ? '-' : x);
  const rank = row.rank ? `#${row.rank}` : 'no rank';
  const evidence = row.evidence ? ` ${row.evidence}/${row.maturity}` : '';
  return [
    row.key.padEnd(36),
    `${v(row.overall)} ${rank}${evidence}`.padEnd(34),
    `code=${v(row.coding)} agent=${v(row.agentic)}`.padEnd(26),
    `boards=${row.boards}`.padEnd(11),
    `$${v(row.priceIn)}/$${v(row.priceOut)}`,
  ].join(' ');
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = { models: null, skill: false, usage: false, selfTest: false, json: false, out: join(tmpdir(), 'benchlm-snapshot') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill') opt.skill = true;
    else if (a === '--models') opt.models = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--usage') opt.usage = true;
    else if (a === '--self-test') opt.selfTest = true;
    else if (a === '--json') opt.json = true;
    else if (a === '--out') opt.out = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log('node scripts/benchlm-snapshot.mjs [--skill | --models k1,k2] [--usage] [--out dir] [--json] [--self-test]');
      return;
    } else throw new Error(`Unknown argument: ${a}`);
  }

  if (opt.selfTest) return selfTest();

  loadDotEnv();
  const key = process.env.BENCHLM_DATA_KEY;
  if (!key) throw new Error('BENCHLM_DATA_KEY is not set (env var or <skill>/.env)');

  if (opt.usage) {
    const u = await get('/usage', key);
    console.log(`plan=${u.plan} used=${u.monthly.successfulReads}/${u.monthly.limit} remaining=${u.monthly.remaining} burstLeft=${u.burst.remaining}/${u.burst.limit}`);
    return;
  }

  let targets;
  let skipped = [];
  if (opt.skill) {
    const seen = new Set();
    targets = [];
    for (const e of IDENTITY) {
      if (!e.key) { skipped.push(`${e.id}: ${e.note}`); continue; }
      if (seen.has(e.key)) continue;
      seen.add(e.key);
      targets.push(e.key);
    }
  } else if (opt.models) targets = opt.models;
  else throw new Error('Pass --skill or --models <key,...>');

  mkdirSync(opt.out, { recursive: true });
  const rows = [];
  for (const mk of targets) {
    const rankings = await get(`/models/${mk}/rankings/current`, key);
    await sleep(2100); // 3 reads/model, 30 req/min ceiling
    const results = await get(`/benchmarks/results/current?modelKey=${mk}&limit=100`, key);
    await sleep(2100);
    const pricing = await get(`/pricing?modelKey=${mk}&limit=50`, key);
    await sleep(2100);
    writeFileSync(join(opt.out, `${mk}.json`), JSON.stringify({ key: mk, pulledAt: new Date().toISOString(), rankings, results, pricing }, null, 2));
    rows.push(summarize(mk, { rankings, results, pricing }));
  }

  if (opt.json) console.log(JSON.stringify({ rows, skipped }, null, 2));
  else {
    for (const row of rows) console.log(fmt(row));
    for (const s of skipped) console.log(`no coverage  ${s}`);
    console.log(`\n${rows.length} models -> ${opt.out}`);
  }
}

// Guards the field paths this script depends on; no network.
function selfTest() {
  const fixture = {
    rankings: {
      model: { name: 'Test Model' },
      rankings: [
        { surface: 'overall', score: 70.5, rank: 12, evidenceStatus: 'estimated', maturity: 'developing', scoreInterval90Lower: 60, scoreInterval90Upper: 81 },
        { surface: 'coding', score: 55.1 },
      ],
    },
    results: { items: [{ modelName: 'Test Model' }, { modelName: 'Test Model' }] },
    pricing: { items: [{ name: 'Test Model', current: { input: 0.1, output: 0.5, since: '2026-01-01' } }] },
  };
  const row = summarize('test-model', fixture);
  const checks = [
    [row.name === 'Test Model', 'name'],
    [row.overall === 70.5 && row.rank === 12, 'overall/rank'],
    [row.coding === 55.1 && row.agentic === null, 'coding/absent surface'],
    [row.interval === '60-81', 'interval'],
    [row.boards === 2, 'board count'],
    [row.priceIn === 0.1 && row.priceOut === 0.5, 'price'],
    [summarize('x', { rankings: null, results: null, pricing: null }).overall === null, 'empty pages'],
    [IDENTITY.every((e) => e.key === null || typeof e.key === 'string'), 'identity map shape'],
    [IDENTITY.filter((e) => e.key === null).every((e) => e.note), 'null entries carry a reason'],
  ];
  const failed = checks.filter(([ok]) => !ok).map(([, label]) => label);
  if (failed.length) {
    console.error(`self-test FAILED: ${failed.join(', ')}`);
    process.exit(1);
  }
  console.log(`self-test ok (${checks.length} checks)`);
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(`error: ${err.message}`);
    process.exit(1);
  });
}