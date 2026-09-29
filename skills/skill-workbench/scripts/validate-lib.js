'use strict';
/**
 * validate-lib.js — shared validation core for skill-workbench.
 * Required by validate.js and inventory.js.
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_SKILLS_ROOT = 'C:/Users/Tiger/.agents/skills';

function read(p) { return fs.readFileSync(p, 'utf8'); }

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fm: null, body: text };
  const raw = m[1];
  const fm = {};
  let currentKey = null;
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*#/.test(line) || line.trim() === '') continue;
    const top = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (top) {
      currentKey = top[1];
      let value = top[2].trim();
      // Folded scalar: value continues on indented lines (YAML multi-line).
      if (value === '') {
        const parts = [];
        let j = i + 1;
        while (j < lines.length && /^[ \t]/.test(lines[j]) && lines[j].trim() !== '' && !/^\s*#/.test(lines[j])) {
          parts.push(lines[j].trim());
          j++;
        }
        if (parts.length) { value = parts.join(' '); i = j - 1; }
      }
      fm[currentKey] = value;
      continue;
    }
    const nested = line.match(/^\s+([a-zA-Z][\w-]*):\s*(.*)$/);
    if (nested && currentKey) {
      if (!fm[currentKey] || typeof fm[currentKey] !== 'object') fm[currentKey] = {};
      fm[currentKey][nested[1]] = nested[2].trim();
    }
  }
  return { fm, body: text.slice(m[0].length) };
}

function kebabCandidates(text) {
  const tokens = new Set();
  const re = /`([a-z][a-z0-9]*(?:[_-][a-z0-9]+)+)`/g;
  let m;
  while ((m = re.exec(text)) !== null) tokens.add(m[1]);
  return [...tokens];
}

// Placeholder markers used in output templates — never real references.
const PLACEHOLDER_RE = /^<(?:[a-z0-9_\-\s]+|\{[^}]*\})>$/i;

// Backticked tokens that are NOT skill references: packages, labels, tokens, roles, subagents.
const NON_SKILL_TOKENS = new Set([
  // npm / PyPI packages & CLI tools
  'better-sqlite3', 'class-variance-authority', 'prom-client', 'osv-scanner', 'pip-audit',
  'stale-while-revalidate', 'web-vitals', 'cross-env', 'express-rate-limit', 'rate-limit-redis',
  'ssrf-req-filter', 'request-filtering-agent', 'drizzle-kit', 'adr-tools',
  'eslint-disable', 'no-explicit-any', 'lark-cli', 'wecom-cli', 'smart-search', 'node_modules',
  // GitHub labels / states
  'ready-for-agent', 'needs-triage', 'stuck-in-a-loop',
  // CSS / design tokens & HTTP directives
  'text-primary', 'bg-surface', 'border-default', 'view-transition-name', 'nav-forward', 'nav-back',
  // ECC install statuses / targets
  'managed-home', 'managed-project', 'hermes-home', 'opencode-home', 'claude-home',
  'antigravity-project', 'legacy-antigravity-layout', 'repo-version-mismatch', 'ecc-universal',
  // subagent / reviewer role names (dispatched via the Agent tool, not the skills dir)
  'code-reviewer', 'security-reviewer', 'python-reviewer', 'fastapi-reviewer', 'django-reviewer',
  'typescript-reviewer', 'react-reviewer', 'vue-reviewer', 'rust-reviewer', 'go-reviewer',
  'database-reviewer', 'a11y-architect', 'test-engineer', 'deploy-to-vercel-worker',
  // speculative host-skill names mentioned in scan lists (system-connector)
  'mcp-builder', 'plugin-customizer', 'skill-installer',
  // model ids / branch-name examples
  'morph-glm52-744b', 'issue-61',
  // GitHub org names (appear backticked in source-recommendation prose)
  'vercel-labs', 'anthropics', 'microsoft',
  // hypothetical example skill names in prose (skill-creator packaging example)
  'research-helper', 'research-helper-v2',
  // pattern-detection's own packet vocabulary (detection modes, not skills)
  'text-prefilter', 'structural-code-rule', 'log-event-pattern', 'metric-anomaly',
  // skill-workbench scorer metric ids (score.js vocabulary, not skills)
  'spec-compliance', 'file-integrity', 'eval-readiness', 'size-discipline', 'self-containment',
  // vi-present-pr figure-interaction / skeleton picker vocabulary (Step 2 controls, not skills)
  'step-play', 'hero-demo', 'split', 'article', 'rail', 'scrub',
  // third-party projects named in docs/ and pipeline prose (repos, not local skills)
  'open-code-review', 'agentskills', 'agent-skills',
  // orca-cli / orchestration name the Orca executables they resolve to, not skills
  'orca-dev', 'orca-ide',
  // harness homes & doc-file slugs that look kebab-case
  'freebuff', 'antigravity', 'hermes', 'gemini', 'opencode', 'open-code',
  'issue-to-pr-skill-workflow', 'coderabbit-plan-prompt', 'agent-home',
]);

// Tokens that look like role names rather than skills.
const ROLE_SUFFIX_RE = /-(reviewer|architect)$/;

/** Basenames (extension-stripped) of every file in the skill folder, any depth. */
function ownFileBasenames(skillDir) {
  const names = new Set();
  const walk = (dir, depth) => {
    if (depth > 2) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else names.add(e.name.replace(/\.[^.]+$/, ''));
    }
  };
  walk(skillDir, 0);
  return names;
}

/**
 * Backticked kebab-case tokens with no folder in the skills root.
 * Exempt: own-skill file basenames (rules/, scripts/, …), known non-skill vocab,
 * role-suffix tokens, and non-hyphenated shapes.
 */
function phantomSkillRefs(text, skillDir, skillsRoot) {
  const own = ownFileBasenames(skillDir);
  const candidates = kebabCandidates(text).filter((t) => !t.includes('/'));
  // Agent-persona names live in ~/.agents/agents/ (sibling of the skills root),
  // not in the skills root — a token that resolves there is not phantom.
  const agentsRoot = path.join(path.dirname(skillsRoot), 'agents');
  const knownNonSkill = new Set([
    // pipeline labels / conventions (GitHub labels & sub-issue dependency edges)
    'needs-answers', 'blocked-by',
    // skills embedded in another SKILL.md by design (no folder of their own)
    'open-code-review-delegate',
    // ECC skills whose logic was absorbed into another skill's body (mentioned as provenance)
    'pr-test-analyzer',
  ]);
  return candidates.filter((t) => {
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(t)) return false;
    if (NON_SKILL_TOKENS.has(t) || ROLE_SUFFIX_RE.test(t)) return false;
    if (knownNonSkill.has(t)) return false;
    if (own.has(t)) return false; // rule slugs / script names of this very skill
    const p = path.join(skillsRoot, t);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return false;
    const a = path.join(agentsRoot, `${t}.md`);
    if (fs.existsSync(a)) return false; // agent persona, not a skill
    return true;
  });
}

function validateSkill(skillDir, opts) {
  opts = opts || {};
  const skillsRoot = opts.skillsRoot || DEFAULT_SKILLS_ROOT;
  const findings = [];
  const add = (severity, check, detail) => findings.push({ severity, check, detail });
  const fmPath = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(fmPath)) {
    add('fail', 'fm-present', `No SKILL.md in ${skillDir}`);
    return { skill: path.basename(skillDir), dir: skillDir, findings };
  }

  let text;
  try { text = read(fmPath); } catch (e) {
    add('fail', 'fm-present', `SKILL.md unreadable: ${e.message}`);
    return { skill: path.basename(skillDir), dir: skillDir, findings };
  }

  const { fm, body } = parseFrontmatter(text);
  const lines = body.split(/\r?\n/);

  // fm-present
  if (!fm) add('fail', 'fm-present', 'SKILL.md has no YAML frontmatter (--- ... ---)');
  else add('pass', 'fm-present', 'Frontmatter present');

  // fm-name-valid
  const name = typeof fm.name === 'string' ? fm.name : '';
  const nameOk = ( /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) || /^[a-z0-9]+$/.test(name) )
    && name.length >= 1 && name.length <= 64 && !name.includes('--');
  if (!nameOk) {
    add('fail', 'fm-name-valid', `name "${name}" violates spec (1-64 chars, lowercase a-z/0-9/hyphens, no lead/trail/double hyphen)`);
  } else {
    add('pass', 'fm-name-valid', `name "${name}" is spec-valid`);
  }

  // fm-name-matches
  const dirName = path.basename(skillDir);
  if (name && name !== dirName) {
    add('fail', 'fm-name-matches', `name "${name}" does not match folder name "${dirName}"`);
  } else if (name) {
    add('pass', 'fm-name-matches', `name matches folder "${dirName}"`);
  }

  // fm-desc-nonempty
  const desc = typeof fm.description === 'string' ? fm.description : '';
  if (!desc || desc.length === 0) {
    add('fail', 'fm-desc-nonempty', 'description is missing or empty');
  } else if (desc.length > 1024) {
    add('fail', 'fm-desc-nonempty', `description is ${desc.length} chars (spec max 1024)`);
  } else if (/^(TODO|TBD|\.\.\.)$/i.test(desc.trim())) {
    add('fail', 'fm-desc-nonempty', `description is a placeholder: "${desc}"`);
  } else {
    add('pass', 'fm-desc-nonempty', `description ${desc.length} chars`);
  }

  // fm-compat-len
  const compat = typeof fm.compatibility === 'string' ? fm.compatibility : '';
  if (compat && compat.length > 500) {
    add('fail', 'fm-compat-len', `compatibility is ${compat.length} chars (spec max 500)`);
  } else if (compat) {
    add('pass', 'fm-compat-len', `compatibility ${compat.length} chars`);
  }

  // body-length (spec progressive-disclosure guidance)
  if (lines.length > 500) {
    add('fail', 'body-length', `body has ${lines.length} lines (spec guidance <= 500); split optional content into on-demand files`);
  } else {
    add('pass', 'body-length', `body ${lines.length} lines`);
  }

  // file-refs: markdown link targets resolve. Backticked paths are NOT checked —
  // they are frequently write-targets or format names, not read references.
  const refRe = /\[[^\]]*\]\(([^)#\s]+)(?:#[^)]*)?\)/g;
  let m;
  const missingRefs = [];
  while ((m = refRe.exec(text)) !== null) {
    const target = m[1];
    if (!target) continue;
    if (/^(https?:|mailto:|#|file:)/i.test(target)) continue;
    if (/^dc:\/\//i.test(target)) continue;            // non-filesystem URI schemes
    if (PLACEHOLDER_RE.test(target)) continue;          // <url>, <github_issue_url>, …
    if (/\.(mdx|html?)$/i.test(target) && !target.startsWith('.')) {
      // vendor-docs style references (e.g. docs/sdk/... inside another repo) — skip bare path mentions
      continue;
    }
    const resolved = path.resolve(skillDir, decodeURIComponent(target));
    if (!fs.existsSync(resolved)) missingRefs.push(target);
  }
  if (missingRefs.length) {
    add('fail', 'file-refs', `Linked paths do not resolve from SKILL.md: ${[...new Set(missingRefs)].join(', ')}`);
  } else {
    add('pass', 'file-refs', 'All relative file references resolve');
  }

  // phantom-skill-refs
  const missing = phantomSkillRefs(text, skillDir, skillsRoot);
  if (missing.length) {
    add('fail', 'phantom-skill-refs', `Backticked skill names with no folder in ${skillsRoot}: ${[...new Set(missing)].join(', ')}`);
  } else {
    add('pass', 'phantom-skill-refs', 'All kebab-case backticked skill references resolve to real skill folders');
  }

  return { skill: path.basename(skillDir), dir: skillDir, findings };
}

/**
 * Every markdown file under a docs root, one flat level of subfolders.
 * A doc that names a skill folder which does not exist is the same defect as
 * a skill naming one — it sends an agent after a path that is not there.
 */
function findDocFiles(docsRoot) {
  if (!fs.existsSync(docsRoot)) return [];
  const out = [];
  const walk = (dir, depth) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (depth < 1) walk(p, depth + 1); }
      else if (/\.md$/i.test(e.name)) out.push(p);
    }
  };
  walk(docsRoot, 0);
  return out;
}

/**
 * Validate documentation files the way skills are validated: every backticked
 * kebab-case skill name must resolve to a real folder in the skills root or a
 * real persona in the agents root.
 */
function validateDocs(docsRoot, opts) {
  opts = opts || {};
  const skillsRoot = opts.skillsRoot || DEFAULT_SKILLS_ROOT;
  const findings = [];
  const add = (severity, check, detail) => findings.push({ severity, check, detail });
  const files = findDocFiles(docsRoot);
  if (!files.length) {
    add('warn', 'docs-scanned', `No markdown files under ${docsRoot}`);
    return { docs_root: docsRoot, files: 0, findings };
  }
  for (const f of files) {
    let text;
    try { text = read(f); } catch (e) {
      add('fail', 'doc-phantom-skill-refs', `${path.basename(f)} unreadable: ${e.message}`);
      continue;
    }
    // A doc has no own-file basenames to exempt: its slugs live elsewhere.
    const missing = phantomSkillRefs(text, docsRoot, skillsRoot);
    if (missing.length) {
      add('fail', 'doc-phantom-skill-refs', `${path.basename(f)} names non-existent skills: ${[...new Set(missing)].join(', ')}`);
    }
  }
  if (!findings.some((x) => x.severity === 'fail')) {
    add('pass', 'doc-phantom-skill-refs', `All skill names in ${files.length} doc file(s) resolve`);
  }
  return { docs_root: docsRoot, files: files.length, findings };
}

function runOn(dir, skillsRoot) { return validateSkill(dir, { skillsRoot }); }

module.exports = { validateSkill, validateDocs, findDocFiles, runOn, parseFrontmatter, kebabCandidates, phantomSkillRefs, DEFAULT_SKILLS_ROOT };
