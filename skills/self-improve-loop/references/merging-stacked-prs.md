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

## An unreviewed PR left open still needs prep

It usually now conflicts with merged `main` (it shared edited files with a merged sibling). When its review finally lands: address findings, rebase onto `main` the same way, re-run the project gate, update the manifest, then merge.
