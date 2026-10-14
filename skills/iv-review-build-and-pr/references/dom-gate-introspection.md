# DOM-gate introspection: flipping a locale/direction toggle without the UI

Station IV Step 0 needs to prove a **direction/locale change** (RTL, theme, language)
renders correctly. Driving the switcher by clicking is slow and brittle; assert the
computed result directly instead.

## Recipe (playwright-cli)

1. **Find the persisted toggle key** — grep the provider/component for the storage
   `setItem` key (e.g. the i18n provider's `STORAGE_KEY`). Do not guess the key name.
2. **Set it, then reload** (the provider reads the key on mount, so a reload is
   required for the flip to take effect):

   ```bash
   playwright-cli localstorage-set <key> he
   playwright-cli goto <url>
   ```

3. **Assert the computed effect in ONE `eval`** — return a small JSON verdict:

   ```bash
   playwright-cli --raw eval "JSON.stringify({ dir: document.documentElement.getAttribute('dir'), toLeft: [...document.querySelectorAll('[style*=gradient]')].filter(e=>/to left/.test(getComputedStyle(e).backgroundImage)).length })"
   ```

   Check `getComputedStyle` (not the raw `style` string) so a framework that resolves
   the class/attr at paint time is still read correctly.

## Pitfalls

- **A wrong route's `404` console entry is not a product defect.** If the page shows
  `404 ... non-existent route`, you hit the wrong path — grep the router
  (`App.tsx` `<Route path=...>`) for the real path and re-check; do not count it as a
  console error against the gate.
- **`playwright-cli console` returns human-readable noise, not machine JSON.** To
  filter for real app errors, pipe through grep (drop the live-reload/HMR port, the
  React-DevTools hint, and framework future-flag warnings) and judge the remainder.
- **Confirm the app actually re-rendered the flip** before asserting values (the reload
  above does this); asserting on a stale DOM returns a false green.
- **Verify the whole set changed, not one instance.** If the fix targets N call sites
  (sliders, bars), assert the count of flipped elements equals N — a single sample can
  pass while others stayed LTR.
