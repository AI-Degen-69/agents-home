'use strict';
/**
 * validate-lib.js — shared validation core for skill-workbench.
 * Required by validate.js and inventory.js.
 */
const fs = require('fs');
const path = require('path');

// Default skills root: `SKILLS_ROOT` wins, else the `skills/` folder this script
// lives in (skills/<workbench>/scripts/ → skills/). Portable by construction —
// the same pattern the per-skill graders use.
const DEFAULT_SKILLS_ROOT = process.env.SKILLS_ROOT ||
  path.resolve(__dirname, '..', '..');

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
      // YAML block scalar indicator: `key: >`, `key: |`, with optional chomping
      // (`>-`, `|+`). The indicator is not part of the value; the real text is
      // on the following indented lines.
      const blockScalar = value.match(/^([>|])([+-]?)$/);
      if (blockScalar) {
        // Inside a block scalar every indented line is scalar CONTENT, even when
        // it looks like `  when: use this skill`. YAML binds by indentation, not
        // by key shape, so the nested-key branch must never see these lines.
        const parts = [];
        let j = i + 1;
        while (j < lines.length && /^[ \t]/.test(lines[j]) && lines[j].trim() !== ''
          && !/^\s*#/.test(lines[j])) {
          parts.push(lines[j].trim());
          j++;
        }
        fm[currentKey] = parts.join(' ');
        i = j - 1;
        continue;
      }
      // Plain folded scalar: the value continues across indented lines. Two shapes
      // are supported — `key: text` continued on the next indented line. Indented
      // lines that are themselves nested keys (`  sub: v`) are left to the nested
      // branch below.
      {
        const parts = value ? [value] : [];
        let j = i + 1;
        while (j < lines.length && /^[ \t]/.test(lines[j]) && lines[j].trim() !== ''
          && !/^\s*#/.test(lines[j]) && !/^\s+[a-zA-Z][\w-]*:/.test(lines[j])) {
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
  // the <!-- local-only:begin/end --> pointer-marker slug that every SKILL.md
  // uses to point at its un-published output template; a marker, not a skill
  'local-only',
]);

// Tokens that look like role names rather than skills.
const ROLE_SUFFIX_RE = /-(reviewer|architect)$/;

/**
 * Narrow vocabulary shapes that read as kebab-case but are never skill names.
 * A token is exempt only when it matches a *known shape* — never by prefix alone,
 * so a typo like `bg-cleanup` or `data-import-skill` still fails the check.
 */

// Tailwind utility prefix → the token is a class, not a skill.
const TAILWIND_PREFIXES = new Set([
  'bg', 'text', 'border', 'ring', 'shadow', 'outline', 'fill', 'stroke', 'from',
  'via', 'to', 'divide', 'placeholder', 'accent', 'caret', 'decoration', 'size',
  'animate', 'transition', 'duration', 'delay', 'ease', 'order', 'z',
]);

// Tailwind suffix that names a semantic design token (may be two words, e.g. muted-foreground).
const TAILWIND_SEMANTIC_SUFFIX = /^(primary|secondary|accent|muted|background|foreground|card|card-foreground|popover|popover-foreground|input|ring|destructive|success|warning|info|destructive-foreground|primary-foreground|secondary-foreground|muted-foreground|accent-foreground|none|transparent|current|inherit|full|auto|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|pulse|spin|ping|bounce|plus|minus|check|x|default|destructive\/10)$/;

// Tailwind suffix that names a palette colour, optionally with a scale step.
const TAILWIND_COLOR_SUFFIX = /^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|black|white)(-(50|100|200|300|400|500|600|700|800|900|950))?$/;

// Standard WAI-ARIA attributes.
const ARIA_ATTRS = new Set([
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
  'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-controls',
  'aria-current', 'aria-describedby', 'aria-details', 'aria-disabled', 'aria-dropeffect',
  'aria-errormessage', 'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
  'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby',
  'aria-level', 'aria-live', 'aria-modal', 'aria-multiline', 'aria-multiselectable',
  'aria-orientation', 'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed',
  'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription', 'aria-rowcount',
  'aria-rowindex', 'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax',
  'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
]);

// Component-state data-* attributes, not references to a data skill.
const DATA_STATE_ATTRS = new Set([
  'data-invalid', 'data-valid', 'data-disabled', 'data-enabled', 'data-loading',
  'data-checked', 'data-unchecked', 'data-selected', 'data-open', 'data-closed',
  'data-active', 'data-focus', 'data-hover', 'data-icon', 'data-state', 'data-slot',
  'data-orientation', 'data-side', 'data-collapsed', 'data-hidden', 'data-visible',
]);

// CSS property names that hyphenate.
const CSS_PROPERTIES = new Set([
  'z-index', 'line-height', 'max-width', 'min-width', 'max-height', 'min-height',
  'font-size', 'font-weight', 'word-break', 'white-space', 'overflow-wrap',
  'text-align', 'flex-grow', 'flex-shrink', 'grid-area', 'aspect-ratio',
]);

// npm packages commonly named in frontmatter/design-system prose.
const KNOWN_PACKAGES = new Set([
  'lucide-react', 'react-router', 'react-router-dom', 'clsx', 'tailwind-merge',
  'class-variance-authority', 'next-themes', 'date-fns', 'react-day-picker',
]);

function isNonSkillVocabulary(token) {
  if (ARIA_ATTRS.has(token)) return true;
  if (DATA_STATE_ATTRS.has(token)) return true;
  if (CSS_PROPERTIES.has(token)) return true;
  if (KNOWN_PACKAGES.has(token)) return true;

  const parts = token.split('-');
  if (parts.length < 2) return false;
  const prefix = parts[0];
  if (!TAILWIND_PREFIXES.has(prefix)) return false;
  const suffix = parts.slice(1).join('-');
  return TAILWIND_SEMANTIC_SUFFIX.test(suffix) ||
    TAILWIND_COLOR_SUFFIX.test(suffix) ||
    /^\d+$/.test(suffix); // size-4, size-10, top-2 …
}

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
    // external provenance citations (mentioned in prose, not local skills)
    'pr-test-analyzer',
  ]);
  return candidates.filter((t) => {
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(t)) return false;
    if (NON_SKILL_TOKENS.has(t) || ROLE_SUFFIX_RE.test(t)) return false;
    if (isNonSkillVocabulary(t)) return false;
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

  // Without frontmatter every remaining frontmatter-dependent check would read
  // `fm.name` off null and throw. Report the one real finding and stop here;
  // body-length, file-refs and phantom-skill-refs still run below.
  if (!fm) {
    add('warn', 'fm-skipped', 'Frontmatter-dependent checks (fm-name-valid, fm-name-matches, fm-desc-nonempty, fm-compat-len) skipped: no frontmatter to read');
  }

  // fm-name-valid
  const name = fm && typeof fm.name === 'string' ? fm.name : '';
  const nameOk = fm && ( ( /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) || /^[a-z0-9]+$/.test(name) )
    && name.length >= 1 && name.length <= 64 && !name.includes('--') );
  if (fm && !nameOk) {
    add('fail', 'fm-name-valid', `name "${name}" violates spec (1-64 chars, lowercase a-z/0-9/hyphens, no lead/trail/double hyphen)`);
  } else if (fm) {
    add('pass', 'fm-name-valid', `name "${name}" is spec-valid`);
  }

  // fm-name-matches
  const dirName = path.basename(skillDir);
  if (fm && name && name !== dirName) {
    add('fail', 'fm-name-matches', `name "${name}" does not match folder name "${dirName}"`);
  } else if (fm && name) {
    add('pass', 'fm-name-matches', `name matches folder "${dirName}"`);
  }

  // fm-desc-nonempty
  const desc = fm && typeof fm.description === 'string' ? fm.description : '';
  if (!fm) {
    // no finding — fm-present already failed and fm-skipped explains the gap
  } else if (desc.length === 0) {
    add('fail', 'fm-desc-nonempty', 'description is missing or empty');
  } else if (desc.length > 1024) {
    add('fail', 'fm-desc-nonempty', `description is ${desc.length} chars (spec max 1024)`);
  } else if (/^(TODO|TBD|\.\.\.)$/i.test(desc.trim())) {
    add('fail', 'fm-desc-nonempty', `description is a placeholder: "${desc}"`);
  } else {
    add('pass', 'fm-desc-nonempty', `description ${desc.length} chars`);
  }

  // fm-compat-len
  const compat = fm && typeof fm.compatibility === 'string' ? fm.compatibility : '';
  if (!fm) {
    // no finding — fm-skipped already covers it
  } else if (compat.length > 500) {
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

module.exports = { validateSkill, validateDocs, findDocFiles, runOn, parseFrontmatter, kebabCandidates, phantomSkillRefs, isNonSkillVocabulary, DEFAULT_SKILLS_ROOT };
