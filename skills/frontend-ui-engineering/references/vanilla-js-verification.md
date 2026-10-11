# Verifying a Vanilla-JS UI Change Without a Browser

Hand-written JS dashboards and static monitors (no framework, no build step) are
the hardest UI change to verify: there is no component test runner, the file is
often thousands of lines, and `require()`-ing it fails at parse time. Two recipes
cover the whole class.

---

## Recipe A — Smoke-test one render function

### When
You added or changed a render/format function in a large vanilla-JS file and need
real evidence it produces the right markup — not a syntax check.

### Steps

1. **Write the scratch script as `.cjs`** when the project's `package.json`
   declares `"type": "module"`. A `.js` script using `require` fails with
   "require is not defined in ES module scope" — the extension is the fix, not
   the code.

2. **Never `require()` the app file.** These files execute browser-only boot code
   at parse time (`localStorage.getItem`, `document.querySelectorAll`,
   `new EventSource`, a top-level `switchTab(savedTab)`, `setInterval`) and throw
   before your function is ever reachable. Stubbing enough globals to load the
   whole file is a losing game.

3. **Slice out the function under test plus its real dependencies** by string
   marker, instead of stubbing the world:

   ```js
   const slice = (from, to) => src.slice(src.indexOf(from), src.indexOf(to));
   const defs    = slice('const SERVICE_DEFS', '/* next comment marker */');
   const helpers = slice('function stateKey', '/* ── XSS defense');
   const target  = slice('function renderThing', 'function renderOther');
   ```

   Pull every symbol the target calls (a defs table, a pill/state builder, the
   project's own escape helper) by the same mechanism. Keep the real helpers —
   re-implementing them makes the test prove your stub, not the code.

4. **Run the concatenated slices in a `vm` context** with a stub DOM:

   ```js
   const els = {};
   const mkEl = () => ({ style: {}, innerHTML: '',
     setAttribute(k, v) { this['a_' + k] = v; },
     getAttribute(k) { return this['a_' + k]; },
     addEventListener() {}, contains: () => false,
     classList: { toggle() {}, add() {}, remove() {} } });
   const sandbox = {
     document: { getElementById: id => els[id] || (els[id] = mkEl()),
                 querySelectorAll: () => [], addEventListener() {} },
     localStorage: { getItem: () => null, setItem: () => {} },
     EventSource: function () { this.close = () => {}; },
     setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0,
     fetch: () => Promise.reject(new Error('offline')),
     console, Math, Number, isFinite, Date,
   };
   vm.createContext(sandbox);
   vm.runInContext(slices + '\n;globalThis.__r = renderThing;', sandbox);
   ```

   One no-op global per browser API the slice touches; add them as the errors
   name them.

5. **Drive every branch with a synthetic payload** — running, stopped,
   telemetry-error, empty — and assert on the produced `innerHTML`: each expected
   row present, counts correct, no leaked `undefined` or `NaN`.

6. **When an assertion fails, decide which side is wrong before changing code.**
   Derive the expected value from the payload you constructed (a summary count
   may legitimately include a watchdog row you did not mentally count). Rewriting
   correct rendering to satisfy a bad expectation is the real bug.

7. **Delete the scratch file before committing** — it is not part of the repo's
   suite and nothing re-runs it. Prefer a repo test when one already exists.

---

## Recipe B — Prove a served change is actually live

### When
The user asks to see the change running ("raise the dashboard", "show me it
working"), or you are about to claim a UI change works.

### Steps

1. **Launch through the project's own venv/interpreter**, not the global one.
   Project servers routinely import packages the global interpreter lacks; a
   missing-dependency crash at launch tells you nothing about your change.

2. **Run it in the background** (it never exits on its own) and **probe a real
   route instead of sleeping and hoping.**

3. **Discover routes by grepping the server source for route decorators**
   (`@app.get`, `@app.post`) rather than guessing a conventional path. A guessed
   `/api/status` returning 404 looks identical to a dead server, and you cannot
   tell which without the grep.

4. **Confirm the served asset, not the source file, carries the change.** Fetch
   the static file the page actually loads and grep it for the new symbol.
   Editing disk proves nothing if the server caches, or serves a different
   directory than the one you edited.

5. **Reveal fire-and-forget**: `start <url>` (Windows) / `open <url>` (macOS).
   The agent's involvement ends at launch — do not drive the browser afterwards.

6. Stop the background server when the review is over; report it was running.

---

## Pitfall — extraction markers are the fragile part

`indexOf` markers silently grab the wrong span when the target function is
renamed, and throw nothing useful when a marker disappears. Always assert both
markers were found (`if (s < 0 || e < 0) throw new Error('marker not found: ' +
name)`) so a refactor fails loudly instead of testing an empty string.
