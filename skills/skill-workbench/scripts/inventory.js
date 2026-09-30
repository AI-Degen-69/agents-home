#!/usr/bin/env node
/**
 * skill-workbench inventory — one-glance state of every skill in the global root.
 * Zero dependencies. Node >= 18.
 *
 * Usage:
 *   node inventory.js [skills-root] [--json]
 *
 * Groups skills by status:
 *   clean      — all checks pass
 *   warn       — no fails, at least one warn
 *   violations — at least one fail
 *   no-evals   — subset marker: has no evals/evals.json (reported alongside status)
 *
 * Recommends the single most valuable skill to work on next:
 *   violations first (most fails), then never-evaluated skills, then warns.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DEFAULT_SKILLS_ROOT = 'C:/Users/Tiger/.agents/skills';
// Reuse the validator in-process.
const { runOn } = require('./validate-lib.js');

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const root = path.resolve(argv.find((a) => a !== '--json') || DEFAULT_SKILLS_ROOT);

  if (!fs.existsSync(root)) {
    console.error(`Skills root not found: ${root}`);
    process.exitCode = 2;
    return;
  }

  const skills = fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(root, d.name))
    .filter((p) => fs.existsSync(path.join(p, 'SKILL.md')));

  const rows = skills.map((dir) => {
    const r = runOn(dir, root);
    const fails = r.findings.filter((f) => f.severity === 'fail');
    const warns = r.findings.filter((f) => f.severity === 'warn');
    const hasEvals = fs.existsSync(path.join(dir, 'evals', 'evals.json'));
    return {
      skill: r.skill,
      dir,
      fails: fails.length,
      warns: warns.length,
      violations: fails.map((f) => `${f.check}: ${f.detail}`),
      warnings: warns.map((f) => `${f.check}: ${f.detail}`),
      has_evals: hasEvals,
      status: fails.length ? 'violations' : warns.length ? 'warn' : 'clean',
    };
  });

  const counts = {
    clean: rows.filter((r) => r.status === 'clean').length,
    warn: rows.filter((r) => r.status === 'warn').length,
    violations: rows.filter((r) => r.status === 'violations').length,
    no_evals: rows.filter((r) => !r.has_evals).length,
  };

  // Recommendation: most fails first, then never-evaluated, then warns. Alphabetical tiebreak for determinism.
  const ranked = [...rows].sort((a, b) =>
    (b.fails - a.fails) || ((b.has_evals === a.has_evals) ? 0 : (a.has_evals ? 1 : -1)) || (b.warns - a.warns) || a.skill.localeCompare(b.skill)
  );
  const recommended = ranked[0];

  const top3 = (list) => list.slice(0, 3);
  const remaining = (list) => list.length > 3 ? list.length - 3 : 0;

  if (json) {
    console.log(JSON.stringify({ skills_root: root, total: rows.length, counts, recommended: recommended && recommended.skill, rows }, null, 2));
  } else {
    console.log(`# סקירת סקילים — ${root}\n`);
    console.log(`סך הכל ${rows.length} סקילים: ✅ ${counts.clean} נקיים | ⚠️ ${counts.warn} אזהרות | ❌ ${counts.violations} לטפל קודם | 🧪 ${counts.no_evals} בלי בדיקות\n`);

    // 1. Missing evals — never eval-tested, most urgent first (violations > warns > alpha).
    const noEvals = rows.filter((r) => !r.has_evals)
      .sort((a, b) => (b.fails - a.fails) || (b.warns - a.warns) || a.skill.localeCompare(b.skill));
    console.log(`## בדיקות חסרות 🧪 (${noEvals.length})`);
    if (!noEvals.length) console.log('אין — לכל הסקילים יש בדיקות.');
    else {
      top3(noEvals).forEach((r, i) => {
        const reason = r.fails ? `יש ${r.fails} הפרות` : r.warns ? `יש ${r.warns} אזהרות` : 'נקי, מעולם לא נבדק';
        console.log(`${i + 1}. סקיל **${r.skill}** — ${reason}`);
      });
      if (remaining(noEvals)) console.log(`ועוד ${remaining(noEvals)} נוספים... (רשימה מלאה ב---json)`);
    }
    console.log('');

    // 2. Warn — no fails, at least one warn.
    const warns = rows.filter((r) => r.status === 'warn')
      .sort((a, b) => (b.warns - a.warns) || a.skill.localeCompare(b.skill));
    console.log(`## אזהרות ⚠️ (${warns.length})`);
    if (!warns.length) console.log('אין.');
    else {
      top3(warns).forEach((r, i) => {
        console.log(`${i + 1}. סקיל **${r.skill}** — יש ${r.warns} אזהרות`);
        for (const w of r.warnings.slice(0, 2)) console.log(`   - ⚠️ ${w}`);
      });
      if (remaining(warns)) console.log(`ועוד ${remaining(warns)} נוספים...`);
    }
    console.log('');

    // 3. Violations — at least one fail, most fails first.
    const viols = rows.filter((r) => r.status === 'violations')
      .sort((a, b) => (b.fails - a.fails) || (b.warns - a.warns) || a.skill.localeCompare(b.skill));
    console.log(`## לטפל קודם ❌ (${viols.length})`);
    if (!viols.length) console.log('אין.');
    else {
      top3(viols).forEach((r, i) => {
        console.log(`${i + 1}. סקיל **${r.skill}** — יש ${r.fails} הפרות${r.warns ? ` ו-${r.warns} אזהרות` : ''}`);
        for (const v of r.violations.slice(0, 2)) console.log(`   - ❌ ${v}`);
      });
      if (remaining(viols)) console.log(`ועוד ${remaining(viols)} נוספים...`);
    }
    console.log('');

    if (recommended) {
      // One section, not two: the recommendation is the default action. Showing a
      // separate "בחירה" menu after "המלצה" contradicts itself — the operator
      // will almost always take the recommendation, so alternatives stay one line.
      console.log(`## הפעולה הבאה 🎯\n`);
      const why = recommended.fails
        ? `יש לו ${recommended.fails} הפרות — תיקון מכני קטן לפני הכל`
        : !recommended.has_evals
          ? `נקי אבל מעולם לא נבדק — להריץ בדיקה ראשונה`
          : `יש לו ${recommended.warns} אזהרות — לסגור ולעבור הלאה`;
      console.log(`מומלץ על **${recommended.skill}** — ${why}.`);
      console.log(`איך לגשת: ולידציה → ביקורת קצרה → ניתוב לעוזר המתאים.`);
      console.log(`להתחיל מהמומלץ: כתוב \`${recommended.skill}\`. אחרת בחר מהרשימות למעלה, לדוגמה \`לטפל קודם 1\` / \`אזהרה 2\` / \`בדיקות 1\`.`);
    }
  }
}

main();
