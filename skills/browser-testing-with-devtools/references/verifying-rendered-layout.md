# Verifying Rendered Layout

How to prove a page renders without clipping or overflow when you cannot see pixels.

## Measure, don't eyeball

A screenshot tells you what the clip rect captured, not what the page does. Crop a screenshot to an element's bounding box and the text past that box reads as "cut off mid-sentence" even though it renders perfectly — one cropped screenshot becomes a truncation bug that does not exist. Confirm every clipping claim with a DOM measurement before changing code or reporting a defect.

Corollary: when a vision read of a screenshot reports truncated text, treat it as unverified until a measurement agrees. The measurement is cheap; reverting a correct page is not.

## The measurement

Run one `page.evaluate` returning every number in a single JSON verdict.

Clipped text — any element carrying a clamp class or a fixed height:

```js
() => [...document.querySelectorAll('[class*="line-clamp"]')].map(el => ({
  text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
  clamp: getComputedStyle(el).webkitLineClamp,
  overPx: el.scrollHeight - el.clientHeight,
  clipped: el.scrollHeight - el.clientHeight > 1
}))
```

Horizontal overflow — the failure that breaks mobile:

```js
() => ({
  docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  offenders: [...document.querySelectorAll('body *')]
    .filter(e => e.scrollWidth - e.clientWidth > 2)
    .slice(0, 8)
    .map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 40), over: e.scrollWidth - e.clientHeight }))
})
```

An element taller than its wrapper is the real fit bug: compare `getBoundingClientRect().bottom` against the wrapper's, or `scrollHeight` against `clientHeight` on the wrapper. Report the worst case, not the average — the tallest item is the one that will break.

## Sweep every rendered state

One measurement covers one state. Carousels, tabs, accordions, and filtered lists change height per state, so loop through all of them and measure each. Copy that fits at index 0 says nothing about index 4, and the longest block is usually not the first.

## Check mobile width too

Narrow the viewport (`page.setViewportSize({ width: 390, height: 844 })`) and re-measure. Long copy that fits at 1280px clips at 390px.

## Design clamp is not a clipping bug

`overPx > 0` on an element carrying a deliberate clamp class (`line-clamp-2` and friends) is **intended truncation with an ellipsis**, not a defect. Do not "fix" it by removing the clamp or shortening copy — the full text normally lives elsewhere (a catalog row, a detail view, a tooltip) and the clamp is what keeps the grid even. Only elements that are *not* clamped and still overflow are bugs.

Before treating a `…` in a screenshot as broken, confirm the ellipsis belongs to a clamp class.

## Overflow that is deliberate

An element with `overflow-x-auto` and a large `scrollWidth` is a horizontal scroller by design — a filter bar or chip row is expected to be wider than its box. The check that must pass is the document-level one (`docOverflowX === 0`); a child scroller exceeding its own box is fine.
