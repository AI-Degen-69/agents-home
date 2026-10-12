# Merging the loop's stacked PRs

Depth for the follow-on the operator requests after a loop run: "merge the reviewed ones, leave out the ones that didn't get a review yet." The loop's own Step 8 gate and `loop-delivery.json` manifest stay in play through the merge.

## Policy

- **Merge only reviewed-and-clean PRs.** A PR that received a real CodeRabbit review ("No actionable comments" or a findings list) and is `MERGEABLE`/`CLEAN` may be merged. A PR whose only bot comment is a "Review limit reached" notice was never reviewed — leave it open.
- Merge one at a time and re-run `npm run check` (the project gate) after each, because stacked loop branches each add a shared module and can interact.

## Decide who actually got a review

```bash
for n in <pr-numbers>; do
  gh pr view $n --json comments \
    --jq '[.comments[]|select(.author.login=="coderabbitai")|{len:(.body|length),limited:(.body|test("Review limit reached|rate limited"))}]'
done
```

A long body (>~5 KB) is a real review; a short body whose `limited` flag is true is a rate-limit notice, not a review.

## Confirm a re-pinged review landed

`@coderabbitai review` returns only a short "Action performed" ack; the review itself posts minutes later and `--json reviews` may stay empty. Poll both signals before calling it reviewed:

```bash
gh pr checks $n | grep -i coderabbit     # "Review completed"
gh api repos/OWNER/REPO/issues/$n/comments \
  --jq '.[]|select(.user.login=="coderabbitai[bot]")|{len:(.body|length)}'   # multi-KB body = real review
```

Zero inline review comments plus a "No actionable comments" body is a clean review — mergeable. Re-ping only after the head is final: CodeRabbit is incremental and skips commits it already reviewed, so a ping sent before a rebase covers stale commits.

## Rebase a stacked sibling onto a just-merged PR

Loop branches are cut from the same base `main`, so the second PR conflicts with the first once the first is merged — almost always in a file both touched (e.g. both added an import and deleted a local helper). Resolve by keeping **both** new shared-module imports and dropping **both** local helper copies:

```bash
git fetch origin <branch>
git checkout -B <branch> origin/<branch>
git rebase main                 # resolve the shared-file conflict by hand
npm test && npm run check       # must be green before pushing
git add <resolved> && GIT_EDITOR=true git rebase --continue
git push --force-with-lease
```

When the conflict is "each side added a different `import {…} from './<shared>.js'`", keep both import lines. When it is "each side deleted a different local copy of the same helper", delete both copies — that is the whole point of the consolidation.

## Keep the delivery manifest and gate honest

- A `--force-with-lease` that moves the head changes `headSha`. Update that PR's `headSha` in `loop-delivery.json` (patch the entry; never rewrite an earlier entry to match a later reality) and re-run the gate before merging.
- After merging, re-running the gate reports `state` FAIL on the merged PRs — expected, because the gate asserts `OPEN`. Confirm the only FAILs are `state`; any other FAIL means investigate before proceeding.

## Close out a run whose last PR was left open

A PR skipped for a rate limit still blocks the run's cleanup: the working files stay until it is terminal. Sequence:

1. `git fetch origin main`; rebase the branch onto it, resolving shared-file conflicts by keeping both shared-module imports and dropping both local helper copies.
2. **Establish the clean baseline before trusting the branch's gate result.** Run the project gate (`npm run check`) on the current `origin/main` *first*. Failures that reproduce on clean `main` are pre-existing drift (e.g. a mirror that has not been re-synced since the canonical folder changed): note them, exclude them, and never fix them inside the loop iteration. Then re-run the gate on the rebased branch and confirm the only failures are the branch's own — a green branch plus known red drift is a truthful report; a green claim over standing red is not.
3. **When the gate reddens only after your content change, follow the gate's own printed instruction.** In a mirrored content repo, copying in new content moves the content hash and the next gate stage fails "content hash is stale / folder vs site mismatch" even though the mirror now passes. That stage is the repo's declared follow-up (bump the version with the repo's version-bump script, `+1.0` for a skill/content change, then re-sync the site), not an error you introduced. Run the bump + re-sync, re-run the full gate, and commit the version/label/hash bumps with the content change — do not revert the fix to force a green.
4. `git push --force-with-lease`; update that PR's `headSha` in `loop-delivery.json`.
5. `@coderabbitai review` — only now, so it covers the final head — and wait for the review to land (see above).
6. Merge with `gh pr merge $n --squash --delete-branch`. Re-run the Step 8 gate (expect only the merged/rebased deltas), then delete `SHARED_TASK_NOTES.md` and `loop-delivery.json`.

## A push rejected as non-fast-forward after a local sync commit

If you committed a local sync/mirror fix while `origin/main` advanced (typically the loop's own squash-merge landing), the push is rejected. Rebase the local commit onto the fetched `origin/main` (`git pull --rebase origin main`), re-run the project gate on the rebased state, then push — do not force-push a shared `main`. Re-verify the gate after the rebase, because the rebase can surface conflicts the pre-rebase green run never saw.
