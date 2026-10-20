#!/usr/bin/env node
/**
 * Static verifier for present-pr HTML documents.
 * Verifies standalone integrity before reveal or commit:
 *   1. Basic HTML structure (DOCTYPE, <html>, <head>, <body> closing tags)
 *   2. Zero external dependencies (no external http/https/cdn script, link, or iframe)
 *   3. Inline JavaScript syntax validity via node:vm
 *
 * Zero dependencies. Node >= 18.
 * Usage:
 *   node scripts/verify-html.js <path-to-html> [--json]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function verifyHtml(filePath) {
  const issues = [];
  const add = (rule, message) => issues.push({ rule, message });

  if (!fs.existsSync(filePath)) {
    return { ok: false, error: `File not found: ${filePath}`, issues: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. DOCTYPE check
  if (!/<!DOCTYPE\s+html/i.test(content)) {
    add('doctype', 'Missing <!DOCTYPE html> declaration at top of file');
  }

  // 2. Structural tags check
  const requiredTags = ['html', 'head', 'body'];
  for (const tag of requiredTags) {
    const openRe = new RegExp(`<${tag}[^>]*>`, 'i');
    const closeRe = new RegExp(`</${tag}>`, 'i');
    if (!openRe.test(content)) add('structure', `Missing opening <${tag}> tag`);
    if (!closeRe.test(content)) add('structure', `Missing closing </${tag}> tag`);
  }

  // 3. External dependencies check (CDNs, remote scripts, stylesheets)
  const externalSrcRe = /<(script|link|iframe|img)[^>]+(src|href)=["'](https?:\/\/|\/\/)[^"']+["']/gi;
  let match;
  while ((match = externalSrcRe.exec(content)) !== null) {
    add('no-external', `Found external resource reference: ${match[0].slice(0, 100)}`);
  }

  // 4. Inline JavaScript syntax check
  const scriptTagRe = /<script(?![^>]*type=["']application\/(json|ld\+json)["'])[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptIndex = 0;
  while ((match = scriptTagRe.exec(content)) !== null) {
    scriptIndex++;
    const jsCode = match[2];
    if (!jsCode || !jsCode.trim()) continue;
    try {
      new vm.Script(jsCode, { filename: `${path.basename(filePath)}:inline-script-${scriptIndex}` });
    } catch (err) {
      add('js-syntax', `Inline script #${scriptIndex} syntax error: ${err.message}`);
    }
  }

  return {
    ok: issues.length === 0,
    file: filePath,
    scriptsChecked: scriptIndex,
    issues,
  };
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const fileArg = args.find((a) => !a.startsWith('--'));

  if (!fileArg) {
    console.error('Usage: node scripts/verify-html.js <path-to-html> [--json]');
    process.exit(2);
  }

  const resolved = path.resolve(process.cwd(), fileArg);
  const result = verifyHtml(resolved);

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nVerifying HTML: ${fileArg}`);
    if (result.error) {
      console.error(`  [FAIL] ${result.error}`);
    } else if (result.ok) {
      console.log(`  [PASS] HTML structure valid`);
      console.log(`  [PASS] No external resources or CDN dependencies`);
      console.log(`  [PASS] ${result.scriptsChecked} inline <script> block(s) passed syntax check`);
      console.log('  -> File is standalone, clean, and ready to reveal.\n');
    } else {
      console.error(`  Found ${result.issues.length} issue(s):`);
      for (const issue of result.issues) {
        console.error(`  - [${issue.rule}] ${issue.message}`);
      }
      console.log('');
    }
  }

  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { verifyHtml };
