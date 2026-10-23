# Plan: Borrow from Matt Pocock Skills v1.3.1

## Objective
Adapt 4 Matt Pocock v1.3.1 concepts into the Hermes Issue-to-PR pipeline:

1. **Parallel build execution** — `iii-build-plan` optionally spawns subagents on disjoint tasks
2. **Dedicated retro skill** — periodic post-session analysis classifying findings into deterministic checks vs `CODING_STANDARDS.md`
3. **Diagram-first PR summaries** — Mermaid/file-tree/pseudocode instead of prose in PR bodies
4. **Merge danger assessment** — blast radius + rollback feasibility in PR body before review

## Feature 1: Parallel Build Execution

### Goal
Add a `parallel` execution mode to `iii-build-plan` that reads the dependency graph in `tasks/plan.md`, identifies the ready frontier (no unresolved deps), and spawns subagents on each frontier task in separate worktrees.

### Current State
- `tasks/plan.md` already has `Depends on:` fields and domain tags per task (from Station II Step 6)
- `iii-build-plan` runs sequentially: Mode A (`/iii-build-plan auto`) processes tasks one-by-one
- Station I already has parallel-safe issue pick (file-disjointness analysis)

### Required Changes
| File | Change |
|------|--------|
| `skills/iii-build-plan/SKILL.md` | Add `/iii-build-plan auto parallel` mode; describe frontier algorithm |
| `skills/iii-build-plan/references/parallel-build.md` (new) | Detail: frontier computation, worktree creation, subagent spawning, integration branch merge |
| `skills/iii-build-plan/references/routing.md` | Ensure domain skill routing works in subagent context |
| `skills/iv-review-build-and-pr/SKILL.md` | Accept subagent-built integration branch (already handles feature branches) |

### Implementation Steps
1. Parse `Depends on:` fields into a graph; compute in-degree per task
2. Frontier = tasks with in-degree 0 (no unresolved deps)
3. For each frontier task: `git worktree add -b i<n>-task-k` in `.worktrees/`, spawn subagent via `delegate_task` with the task context
4. Wait for all subagents; collect results
5. Recompute frontier (decrement in-degrees of dependents)
6. Repeat until all tasks done
7. Merge all task branches into one integration branch
8. Continue to Station IV (existing flow)

### Key Risks
- **Worktree cleanup**: ensure all worktrees are removed after integration
- **Subagent context**: each subagent gets only its task + relevant code context (not the whole plan)
- **Conflict resolution**: parallel tasks on overlapping files — Station I's file-disjointness check should prevent this at task level
- **Error handling**: if a subagent fails, do we abort or continue with partial results?

### Dependencies
- `delegate_task` tool (already available)
- `git-worktree-operations` skill for safe worktree management

---

## Feature 2: Dedicated Retro Skill

### Goal
Create a `/retro` skill that analyzes a completed coding session and proposes environment improvements (not code changes), classified into mechanical checks (linters/hooks/CI) vs judgment calls (CODING_STANDARDS.md).

### Current State
- No dedicated retro skill exists
- Guardrail improvements are fragmented: `CONSTRAINTS.md` (Station II), `NOTICED-BUT-NOT-TOUCHING` ledger (Station VI), dead-code removal (Station VI)
- Station I Step 5: One Improvement Proposal (evidence-based, classified adoption)

### Required Changes
| File | Change |
|------|--------|
| `skills/retro/SKILL.md` (new) | Full skill: invocation, input sources, classification taxonomy, output format |
| `skills/retro/references/classification.md` (new) | Mechanical vs judgment call criteria |
| `skills/retro/AGENTS.md` (new, local-only) | Integration: invoke after Station V merge or on explicit request |

### Implementation Steps
1. Create skill folder `~/.agents/skills/retro/`
2. Define input sources: PR comments, CodeRabbit review findings, test failures, git diff, CI logs
3. Build classification logic:
   - **Mechanical**: pattern violations repeatable by a tool → suggest linter rule, pre-commit hook, or CI job
   - **Judgment call**: style, architecture, convention → suggest `CODING_STANDARDS.md` entry
   - **No guardrail**: missing entirely → finding in its own right
4. Output: structured report with proposed changes, classification, and evidence
5. Human approval required (not autopilot)

### Key Risks
- Input source availability varies by repo (no CodeRabbit → no findings from CR)
- Classification taxonomy must be simple enough for an agent to apply consistently
- Should not become a nitpick spiral — periodic, not per-task

### Integration Point
After Station V (`v-babysit-pr-and-merge`) merge, or as an explicit `/retro` call by the operator.

---

## Feature 3: Diagram-First PR Summaries

### Goal
Enhance `iv-review-build-and-pr` Step 5 to generate visual summaries (Mermaid diagrams, file trees, call trees, pseudocode) instead of prose-heavy PR descriptions.

### Current State
- Station IV Step 5 writes PR body with sections: `## Summary`, `## How to verify`, `## Verification`
- `present-pr` skill generates visual HTML showcase but is ad-hoc (post-merge)
- GitHub supports Mermaid in markdown PR bodies

### Required Changes
| File | Change |
|------|--------|
| `skills/iv-review-build-and-pr/SKILL.md` | Step 5: add diagram-first summary generation before prose |
| `skills/iv-review-build-and-pr/references/diagram-generation.md` (new) | Logic: change-type → diagram-type mapping, generation rules |

### Implementation Steps
1. Classify the change type (per diff analysis):
   - **Refactor**: file tree diff (before/after)
   - **New feature**: call tree / data flow diagram
   - **Bug fix**: before/after behavior state transition
   - **API change**: interface contract diagram
2. Generate the "smallest visual" — pseudocode, Mermaid, or file tree
3. Place the diagram as the FIRST element of `## Summary`
4. Keep prose as fallback/explanation below the diagram

### Change-Type → Diagram Mapping
| Change Type | Diagram Type | Tool |
|-------------|-------------|------|
| API/interface change | Contract diagram | Mermaid flowchart |
| New module/feature | File tree + call tree | `git ls-files` + manual |
| Refactor | File tree diff (before/after) | `git diff --name-status` |
| Bug fix | State transition (before→after) | Mermaid state diagram |
| UI change | Before/after screenshot | `playwright-cli screenshot` |

### Key Risks
- Mermaid syntax errors break rendering on GitHub
- Diagram generation adds latency to PR creation
- Some changes are genuinely text-only (config files, etc.)

---

## Feature 4: Merge Danger Assessment

### Goal
Add a `## Merge Danger` section to PR bodies in `iv-review-build-and-pr` Step 5, assessing one/two-way door, blast radius, and rollback feasibility.

### Current State
- Station V has the timeout-merge rule and CI check verification
- No formal pre-merge risk assessment
- CodeRabbit review classification happens in Station V

### Required Changes
| File | Change |
|------|--------|
| `skills/iv-review-build-and-pr/SKILL.md` | Step 5: add `## Merge Danger` section before PR creation |
| `skills/iv-review-build-and-pr/references/merge-danger.md` (new) | Risk assessment logic |

### Implementation Steps
1. Parse the diff to compute:
   - **Blast radius**: number of files, directories, modules, endpoints affected
   - **Change category**: config / docs / code / API / schema / data migration
2. Assess decision type:
   - **One-way door** (hard to rollback): DB migrations, public API changes, data model changes
   - **Two-way door** (easy to rollback): UI tweaks, config changes, internal refactors
3. Assess rollback feasibility:
   - **Easy**: ≤2 files, no external state, no migration
   - **Moderate**: internal logic changes, reversible
   - **Hard**: DB schema, data migrations, external API contract changes
4. Write `## Merge Danger` section in PR body:
   ```
   ## Merge Danger
   - **Decision:** Two-way door (reversible)
   - **Blast radius:** 3 files (auth middleware, 1 component, 1 config)
   - **Rollback:** Easy — full revert via single commit, no data/state impact
   ```

### Risk Matrix
| Category | Decision | Rollback |
|----------|----------|----------|
| ≤2 files, config/docs | Two-way | Easy |
| Internal refactors (≤5 files) | Two-way | Easy |
| Public API change | One-way | Hard |
| DB schema migration | One-way | Hard |
| Data migration | One-way | Hard |

### Key Risks
- Blast radius computation may miss transitive dependencies
- Rollback assessment should be conservative (err on "harder" side)
- Should feed into Station V's review-depth decision (light vs heavy review)

---

## Execution Order Recommendation

1. **Start with Feature 4 (Merge Danger)** — lowest risk, enhances existing PR body, no new skills
2. **Feature 3 (Diagram-first PR)** — builds on same Step 5 changes, adds Mermaid generation
3. **Feature 2 (Retro skill)** — new skill, moderate complexity, can be developed independently
4. **Feature 1 (Parallel build)** — highest complexity, touches core build orchestration, do last

## Open Questions for Robert

1. Should `retro` be a global skill (`~/.agents/skills/retro/`) or project-local (`.agents/skills/`)?
2. For parallel builds: if a subagent fails on one task, should we abort the whole build or continue with remaining frontier tasks?
3. Where should the retro trigger sit — after Station V merge, after Station VI close, or both?
