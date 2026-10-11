# Cross-Harness Wiring Audit

Procedure for "how does X work across all my agents" — tracing a tool, rule, hook, or
skill across every installed harness and reporting which ones are actually wired.

The failure mode this file prevents: reading one harness's copy of a rule and calling it
authoritative, or grepping all of `$HOME` and drowning in vendored-plugin noise.

## 1. Enumerate the harness roots before searching

Each harness keeps its own config root. On a Windows machine with a shared agent home:

| Harness | Config root | Wiring surface |
|---|---|---|
| Hermes (desktop/CLI) | `%LOCALAPPDATA%\hermes` | `config.yaml` (`plugins.enabled`, `hooks.enabled`) + `plugins/<name>/__init__.py` |
| Gemini CLI / Antigravity | `~/.gemini/config` | `config.json` (`plugins` block) + `plugins/<name>/rules/AGENTS.md` |
| Claude Code | `~/.claude` | `settings.json` (`hooks`, e.g. `PreToolUse` matcher on `Bash`) |
| OpenCode | `~/.config/opencode` | `opencode.json` |
| Codex | `~/.codex` | `config.toml`, `.tmp/plugins/` (vendored trees) |
| Shared canonical home | `~/.agents` | `AGENTS.md` (router), `skills/`, `rules/`, `scripts/` |

Read the shared home's `AGENTS.md` FIRST — it declares the routing architecture and which
directories are distributed. Harness-global files often just point at it
(e.g. `~/.gemini/GEMINI.md` = "read and follow ~/.agents/AGENTS.md").

## 2. Check the sync script to learn what is distributed

Read `~/.agents/scripts/sync-harness-skills.ps1` (or equivalent) to see exactly which
canonical directories get pushed into which harness roots, and by what link type
(Junction vs SymbolicLink — Gemini cannot see a Junction).

**Pitfall:** any canonical directory the sync script does NOT cover (e.g. `rules/` next to
a synced `skills/`) is not propagated anywhere. A file there is an orphaned duplicate —
its content is not live in any harness. Say so in the report; do not treat it as the
source of truth.

## 3. Find the wiring mechanism, not the doc

For each harness, locate the actual activation mechanism:

- plugin/extension enablement in the harness config
- hook registration (hook type + matcher + command it shells out to)
- rules/injection file the harness auto-loads

Then read the implementation if it is small (a Hermes plugin's `__init__.py` or a Claude
hook command tells you exactly what runs, in what order, and how it fails).

**Mechanisms differ — report them differently:**

| Mechanism | Meaning for the report |
|---|---|
| Rule file ("always prefix with X") | The model is *instructed* to comply; compliance is best-effort |
| Hook / plugin rewrite | *Automatic* interception before execution; no model compliance needed |
| Not present | Zero coverage — the honest answer for that harness |

When a harness already has automatic rewrite, a manual-prefix rule for the same tool is
redundant (rewrite is a no-op passthrough when already applied) — note it as redundancy,
not as a failure.

## 4. Verify the tool is installed AND actually in use

- `<tool> --version` proves the binary exists
- the tool's own analytics/self-check command proves it has been running
  (e.g. a token-savings report showing lifetime command count and savings %)
- if the tool's docs warn of a name collision (same command name, different project),
  confirm identity via the analytics command before claiming the install is correct

## 5. Test the mechanism behaviorally

Don't infer behavior from docs — invoke the mechanism:

```bash
<tool> rewrite "<some common command>"   # shows rewrite vs passthrough
```

A distinct return code per outcome (e.g. rewritten vs passthrough) is a clean probe.

## 6. Diff canonical copy against the live harness copy

Before calling either one stale, diff them:

```bash
diff ~/.agents/rules/<rule>.md ~/.gemini/config/plugins/<tool>/rules/AGENTS.md
```

Report which is newer/richer (more examples, an exceptions section) and recommend either
delete-the-orphan or make-the-canonical-the-source. Never edit a harness copy in place
without asking — the harness may regenerate it.

## Pitfalls

- Never grep all of `$HOME` for a keyword: vendored plugin trees under
  `~/.codex/.tmp/plugins/` are huge and full of false hits (unrelated products whose
  names contain your keyword). Scope per harness root.
- Broad recursive searches time out; run them one harness root at a time with a tight
  scope rather than one home-wide sweep.
- Binaries are binaries: `cat`-ing an executable floods the context. Use `ls -la` to
  confirm presence and size, then `<tool> --help` for behavior.
- Missing binaries/unconfigured plugins are environment state, not findings — fix them
  and move on.
- Report coverage as a table (harness x mechanism x config path); the user's standing
  question is always "which of my agents are covered and how".

## Report shape

1. What the tool is (one line + live proof of use)
2. Per-harness table: mechanism, config path, rule doc path
3. Findings: orphaned duplicates, uncovered harnesses, redundant rules
4. One recommendation with the decision the user must make
