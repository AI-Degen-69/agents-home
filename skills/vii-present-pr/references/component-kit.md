# Component Kit (Step 4 companion)

Canonical source for the vii-present-pr copy-paste kit. Vanilla only — fill
with THIS job's words, never ship the placeholders as-is. Compose only the
blocks picked in Step 2 (see `visual-pickers.md`).

## Base shells — pick ONE per page (do not mix dark + light)

```html
<!-- Dark shell (hero-demo / split / rail) -->
<style>
:root { --ink:#eaf1f6; --muted:#9aabb8; --bg:#0b1117; --panel:#121c25; --panel-2:#172530;
--line:#29404d; --accent:#55d6c2; --accent-ink:#06281f; --shadow:0 20px 55px rgba(0,0,0,.28); }
* { box-sizing:border-box } body { margin:0; color:var(--ink); background:var(--bg); font:16px/1.65 "Segoe UI",Tahoma,sans-serif }
main { max-width:1100px; margin:auto; padding:40px 20px 70px }
.panel { background:var(--panel); border:1px solid var(--line); border-radius:18px; padding:26px; margin-top:24px; box-shadow:var(--shadow) }
.figure { border:1px solid var(--line); border-radius:14px; overflow:hidden; background:var(--panel-2) }
.figure-label { font-size:.7rem; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); padding:.8rem 1rem 0 }
.figure-controls { display:flex; gap:.5rem; align-items:center; padding:.6rem 1rem; border-top:1px solid var(--line); flex-wrap:wrap }
.ctrl-btn { font-size:.75rem; padding:.4rem .9rem; border-radius:8px; border:1px solid var(--line); background:#fff; cursor:pointer }
.ctrl-btn.primary { background:var(--accent); border-color:var(--accent); color:var(--accent-ink); font-weight:700 }
.ctrl-btn.active { background:var(--ink); color:var(--bg) }
.figure-caption { font-size:.78rem; color:var(--muted); padding:.6rem 1rem .8rem; border-top:1px solid var(--line) }
.callout { border-left:3px solid var(--accent); background:rgba(255,255,255,.04); padding:1rem 1.2rem; border-radius:0 8px 8px 0; margin:1.2rem 0 }
</style>
<!-- Light article shell (distill-style, for how-it-works / sequence / dataflow with prose) -->
<style>
:root { --ink:rgba(0,0,0,.8); --muted:rgba(0,0,0,.54); --bg:#FAF8F4; --panel:#fff; --line:rgba(0,0,0,.08);
--accent:#2563EB; --accent-light:#EFF6FF; --accent-dark:#1E40AF; }
body { background:var(--bg); color:var(--ink); font:18px/1.75 Georgia,serif }
.page { max-width:960px; margin:auto; padding:0 24px; display:flex; gap:40px }
.sidebar { width:200px; position:sticky; top:24px; height:fit-content; font:12px sans-serif }
.content { flex:1; max-width:680px } .figure { background:#fff; border:1px solid var(--line); border-radius:8px; overflow:hidden; margin:2rem 0 }
@media(max-width:900px){ .sidebar{display:none} .page{display:block} }
</style>
```

## Shared JS (put once per page)

```js
const dpr = window.devicePixelRatio||1;
function initCanvas(id){ const c=document.getElementById(id); const x=c.getContext('2d');
const w=c.width,h=c.height; c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px';
x.scale(dpr,dpr); return {canvas:c,ctx:x,w,h}; }
```

## Snippets

1) Sequence lifelines (SVG — use for call chain):
```html
<svg viewBox="0 0 640 220" role="img" style="width:100%;height:auto">
<!-- 3 lifelines + 3 arrows, dashed returns. Replace labels with THIS job's actors. -->
</svg>
```

2) Dataflow dots (Canvas flow — use for pipeline):
```js
(function(){ const {ctx,w,h}=initCanvas('canvas-flow'); let t=0;
// Canvas API does NOT parse CSS vars — read the real hex once, at page load:
const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#55d6c2';
const pts=Array.from({length:18},(_,i)=>({o:i/18}));
function draw(){ ctx.clearRect(0,0,w,h); ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=22;
ctx.beginPath(); ctx.moveTo(40,h/2); ctx.lineTo(w-40,h/2); ctx.stroke();
ctx.fillStyle=ACCENT; } // always a real hex — falls back to the speed-win accent if --accent is unset
function loop(){ t+=0.016; draw(); requestAnimationFrame(loop);} loop(); })();
```

3) Lifecycle rail (HTML — use for states):
```html
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
<div class="panel">Waiting</div><div class="panel">Trying</div>
<div class="panel">Retry wait</div><div class="panel" style="border-color:var(--accent)">Done ✓</div>
</div>
```

4) Tabbed compare (use for choice):
```html
<div class="figure-controls" id="tabs-x">
<button class="ctrl-btn active">Before</button><button class="ctrl-btn">After</button>
</div>
```

5) Stepper (use for retry/behavior):
```html
<div class="figure-controls"><button class="ctrl-btn primary" id="s-step">Step</button>
<button class="ctrl-btn" id="s-play">Play</button><button class="ctrl-btn" id="s-reset">Reset</button>
<span id="s-info">Step: 0</span></div>
```

6) Slider explorer (use for threshold/count):
```html
<div class="figure-controls"><span>Wait</span>
<input id="p-x" type="range" min="1" max="10" value="3"><span id="p-v">3s</span></div>
```

## Ideas borrowed

- archify: 5 typed diagrams (architecture/workflow/sequence/dataflow/lifecycle) + pick-by-content + one primary path.
- explain-this: distill article skeleton, hand-built Canvas IIFEs (stepped / flow / tabs / slider), DPR-aware `initCanvas`, captions that say what to watch, callouts for key insight.
