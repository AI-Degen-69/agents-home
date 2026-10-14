# Metric semantics and bands — defining a metric before building it

When a metric is being specified for an analytics surface (dashboard readout, report,
alert, issue acceptance criteria), define its semantics BEFORE the builder writes code. A
metric with no stated range, direction, and bands gets implemented with a guessed
threshold and a colour that means nothing.

## Procedure (per metric)

1. **Formula** — the exact expression, with every input field named and traced to where it
   is recorded. If an input does not exist in the schema, say so: it becomes a new field or
   the metric is out of scope.
2. **End-to-end range** — the mathematical bounds, written with operators and interval
   notation: `[0, 1]`, `[-1.00, +1.00]`, `[0, +oo)`. Bound it from the domain (binary
   prices live in `[0.00, 1.00]`), not from intuition.
3. **Direction — which way is bad?** State it explicitly, out loud. High is not
   automatically good: a fill-rate or touch-to-fill ratio near its maximum is the
   *optimistic/phantom* failure for a realism metric. Get this wrong and every band is
   inverted.
4. **Traffic-light bands** — three rows (good / average / bad) that partition the range,
   each threshold tied to something real: an existing config threshold, one book spread, a
   domain constant. "It feels about right" is not a basis.
5. **Denominator choice for ratios** — name the base and say which question it answers.
   A percent of the reference price, of the entry cost, and of the planned risk are three
   different metrics. Measure each hop against *its own* reference price so an additive
   total stays additive.
6. **Redundancy check** — if the metric is a pure algebraic function of another metric
   already specified (a shared term cancels, e.g. `degradation = -SLED`), it is a
   duplicate under a second name. Replace it with a decision-grade derived form that adds
   a denominator: `overshoot = SLED / planned_risk`, where `> 1x` means the guard failed
   to contain the loss.
7. **Encode it** — write formula, range, and bands into the issue's acceptance criteria,
   and state the UI rule: the displayed value is coloured by its own band (green/yellow/red
   from the live value, using the shared status palette, no new categorical hues).

## Pitfalls

- **Ratios with a shrinkable denominator are unbounded above** — `[0, +oo)` when the
  denominator can approach zero. They need an explicit zero-division guard, and a percent
  form is often unbounded in one direction even when the underlying quantity is bounded (a
  `[-1, +1]` quantity over a small reference reads far past +-100%).
- **Never calibrate bands on a stale measurement.** Bands anchored on an old run of an
  older code version are guesses wearing a spec's clothes. Measure current behaviour first,
  or state the band as a proposal pending measurement.
- **A magnitude is not a quality.** A raw size (queue depth, dollar volume) has no honest
  good/bad on its own; derive the ratio that makes it comparable (depth over order size)
  and band that.
- **Don't band a distribution the current code cannot produce.** If the mechanism is
  all-or-nothing, a band expecting intermediate values is never exercised — check the
  mechanism before specifying the distribution.
- **A metric that only reads as a model's internal consistency is not a reality check.**
  Say which it is; validation against observed behaviour is a separate, later step.

## Output shape

Plain language, one table per metric: range with operators and `[ ]` interval notation,
three colour rows, and a stated threshold basis. Close with a one-line summary table:
metric → range → bad-when.
