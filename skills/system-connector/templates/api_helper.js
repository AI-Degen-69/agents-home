#!/usr/bin/env node
/**
 * <SYSTEM> API helper — deterministic CLI for the <SYSTEM> integration.
 *
 * Requirements: Node >= 18 (built-in fetch). No npm dependencies.
 *
 * Credentials are read from <host-root>/connectors/<SLUG>/.env, resolved
 * automatically from this script's installed location. Never hardcode
 * credentials here and never pass them as CLI arguments.
 *
 * Template usage: replace <SYSTEM>, <SLUG>, the ENV_VARS table, and the
 * COMMANDS section with the real integration. Keep setup/where/test as-is.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

// ---------------------------------------------------------------------------
// Configuration (edit per integration)
// ---------------------------------------------------------------------------

const SLUG = "<SLUG>"; // e.g. 'acme-crm' — used for the connectors/<SLUG>/.env path

// Only variables the user must edit for the default working connection.
// Keep optional auth modes, output format flags, SSL toggles, tenant IDs,
// scopes, and advanced settings out of ENV_VARS unless the default connection
// cannot work without them. Safe defaults belong in code.
// `required` vars are checked by `test`; each comment must tell the user where
// to find or create the value in the vendor system.
const ENV_VARS = [
    { name: "BASE_URL", required: true, example: "https://api.example.com", comment: "Root URL of the <SYSTEM> API" },
    { name: "API_TOKEN", required: true, example: "paste-your-token-here", comment: "API token from <where to get it>" },
];

// ---------------------------------------------------------------------------
// Credential resolution — DO NOT EDIT
// The helper is installed at <host-root>/skills/<slug>/...; walk up to the
// directory that contains `skills/` and treat its parent as <host-root>.
// Fallback: ~/.claude
// ---------------------------------------------------------------------------

function resolveHostRoot() {
    let dir = __dirname;
    while (true) {
        const parent = path.dirname(dir);
        if (path.basename(dir) === "skills") {
            return parent;
        }
        if (parent === dir) {
            break; // reached filesystem root
        }
        dir = parent;
    }
    return path.join(os.homedir(), ".claude");
}

function envPath() {
    // CONNECTOR_ENV_PATH is the only supported override — tests, CI, dev setups.
    if (process.env.CONNECTOR_ENV_PATH) {
        return process.env.CONNECTOR_ENV_PATH;
    }
    return path.join(resolveHostRoot(), "connectors", SLUG, ".env");
}

function parseEnv(text) {
    const out = {};
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }
        const eq = line.indexOf("=");
        if (eq === -1) {
            continue;
        }
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        out[key] = val;
    }
    return out;
}

function loadEnv() {
    const p = envPath();
    if (!fs.existsSync(p)) {
        fail(`Credentials file not found: ${p}\nRun: node ${path.basename(__filename)} setup`);
    }
    const env = parseEnv(fs.readFileSync(p, "utf8"));
    for (const v of ENV_VARS) {
        if (v.required && (!env[v.name] || env[v.name] === v.example)) {
            fail(`Missing value for ${v.name} in ${p}\nOpen the file and fill it in, then re-run.`);
        }
    }
    return env;
}

// ---------------------------------------------------------------------------
// HTTP — single deterministic request path. Edit auth header per integration.
// ---------------------------------------------------------------------------

async function apiRequest(env, method, apiPath, { query, body } = {}) {
    const url = new URL(apiPath.replace(/^\//, ""), env.BASE_URL.endsWith("/") ? env.BASE_URL : env.BASE_URL + "/");
    for (const [k, v] of Object.entries(query || {})) {
        if (v !== undefined && v !== null) {
            url.searchParams.set(k, String(v));
        }
    }
    const res = await fetch(url, {
        method,
        headers: {
            // EDIT: real auth scheme from the docs (Bearer, Basic, custom header...)
            Authorization: `Bearer ${env.API_TOKEN}`,
            Accept: "application/json",
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
        fail(`HTTP ${res.status} ${res.statusText} for ${method} ${url.pathname}\n${text.slice(0, 500)}`);
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// ---------------------------------------------------------------------------
// Built-in commands: setup / where / test — keep in every connector
// ---------------------------------------------------------------------------

function cmdWhere() {
    process.stdout.write(envPath() + "\n");
}

function cmdSetup() {
    const p = envPath();
    if (fs.existsSync(p)) {
        console.log(`Already exists (left untouched): ${p}`);
        return;
    }
    fs.mkdirSync(path.dirname(p), { recursive: true, mode: 0o700 });
    const lines = [
        "# <SYSTEM> connector credentials",
        "# This file stays on your computer. The assistant never reads it;",
        "# the helper script reads it locally when it makes API calls.",
        "",
        ...ENV_VARS.flatMap((v) => [`# ${v.comment}`, `${v.name}=${v.example}`, ""]),
    ];
    fs.writeFileSync(p, lines.join("\n"), { mode: 0o600 });
    console.log(`Created: ${p}`);
}

async function cmdTest() {
    const env = loadEnv();
    // EDIT: cheapest authenticated read the API offers (whoami / ping / version).
    const result = await apiRequest(env, "GET", "/ping");
    console.log("OK — connection works.");
    if (result && typeof result === "object") {
        console.log(JSON.stringify(result, null, 2));
    }
}

// ---------------------------------------------------------------------------
// API commands (edit per integration) — cover every non-destructive endpoint.
// Each entry: name, positional args, description, handler.
// ---------------------------------------------------------------------------

const COMMANDS = {
    setup: { args: "", desc: "Create the empty credentials file (idempotent)", run: cmdSetup },
    where: { args: "", desc: "Print the credentials file path", run: cmdWhere },
    test: { args: "", desc: "Verify credentials with a harmless API call", run: cmdTest },
    // EXAMPLE — replace with the real read surface:
    // 'list': {
    //   args: '<resource>',
    //   desc: 'List records of a resource, e.g. list customers',
    //   run: async (a) => print(await apiRequest(loadEnv(), 'GET', `/${need(a[0], 'resource')}`)),
    // },
    // 'get': {
    //   args: '<resource> <id>',
    //   desc: 'Fetch one record by id',
    //   run: async (a) => print(await apiRequest(loadEnv(), 'GET', `/${need(a[0], 'resource')}/${need(a[1], 'id')}`)),
    // },
    // 'raw': {
    //   args: '<method> <path>',
    //   desc: 'Escape hatch: any GET-like call, e.g. raw GET /v1/items?limit=5',
    //   run: async (a) => print(await apiRequest(loadEnv(), need(a[0], 'method').toUpperCase(), need(a[1], 'path'))),
    // },
};

// ---------------------------------------------------------------------------
// CLI plumbing — DO NOT EDIT below this line
// ---------------------------------------------------------------------------

function print(v) {
    console.log(typeof v === "string" ? v : JSON.stringify(v, null, 2));
}

function need(value, label) {
    if (value === undefined) {
        fail(`Missing argument: <${label}>. Run with --help for usage.`);
    }
    return value;
}

function fail(msg) {
    console.error(msg);
    process.exit(1);
}

function usage() {
    const rows = Object.entries(COMMANDS).map(([name, c]) => `  ${`${name} ${c.args}`.padEnd(28)} ${c.desc}`);
    console.log(`Usage: node ${path.basename(__filename)} <command> [args]\n\nCommands:\n${rows.join("\n")}`);
}

async function main() {
    const [cmd, ...args] = process.argv.slice(2);
    if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
        usage();
        return;
    }
    const command = COMMANDS[cmd];
    if (!command) {
        fail(`Unknown command: ${cmd}. Run with --help for usage.`);
    }
    await command.run(args);
}

if (require.main === module) {
    main().catch((err) => fail(err && err.message ? err.message : String(err)));
}

module.exports = { parseEnv, resolveHostRoot, envPath, apiRequest, print, need, ENV_VARS, SLUG };
