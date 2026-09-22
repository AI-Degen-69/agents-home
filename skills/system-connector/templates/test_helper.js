#!/usr/bin/env node
/**
 * Self-tests for the <SYSTEM> helper. Run: node --test test_helper.js
 *
 * Rules:
 *  - Zero network access. All API-shaped data comes from FIXTURES below,
 *    which must be copied verbatim from official docs or real observed
 *    responses (cite the source in a comment next to each fixture).
 *  - Tests must pass before the artifact leaves the build directory.
 */

"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const helper = require("./api_helper.js");

// ---------------------------------------------------------------------------
// Fixtures — replace with real documented responses, cite the doc URL.
// ---------------------------------------------------------------------------

// Source: <docs URL for this example response>
const FIXTURE_LIST_RESPONSE = {
    items: [{ id: 1, name: "Example" }],
    total: 1,
};

// ---------------------------------------------------------------------------
// .env parsing
// ---------------------------------------------------------------------------

test("parseEnv reads simple key=value pairs", () => {
    const env = helper.parseEnv("BASE_URL=https://api.example.com\nAPI_TOKEN=abc123\n");
    assert.equal(env.BASE_URL, "https://api.example.com");
    assert.equal(env.API_TOKEN, "abc123");
});

test("parseEnv ignores comments and blank lines", () => {
    const env = helper.parseEnv("# comment\n\nKEY=value\n  # indented comment\n");
    assert.deepEqual(env, { KEY: "value" });
});

test("parseEnv strips surrounding quotes", () => {
    const env = helper.parseEnv("A=\"quoted\"\nB='single'\n");
    assert.equal(env.A, "quoted");
    assert.equal(env.B, "single");
});

test("parseEnv keeps = signs inside values", () => {
    const env = helper.parseEnv("TOKEN=abc=def==\n");
    assert.equal(env.TOKEN, "abc=def==");
});

// ---------------------------------------------------------------------------
// Credential path resolution
// ---------------------------------------------------------------------------

test("envPath ends with connectors/<slug>/.env", () => {
    const p = helper.envPath();
    assert.ok(p.endsWith(path.join("connectors", helper.SLUG, ".env")), p);
});

test("CONNECTOR_ENV_PATH overrides the resolved path", () => {
    const override = path.join(path.sep, "tmp", "test-connector", ".env");
    process.env.CONNECTOR_ENV_PATH = override;
    try {
        assert.equal(helper.envPath(), override);
    } finally {
        delete process.env.CONNECTOR_ENV_PATH;
    }
});

test("every required env var has an example and comment", () => {
    for (const v of helper.ENV_VARS) {
        assert.ok(v.name, "var has a name");
        assert.ok(v.example, `${v.name} has an example`);
        assert.ok(v.comment, `${v.name} has a comment`);
    }
});

// ---------------------------------------------------------------------------
// Response parsing — EDIT: test the real parsing/shaping logic the helper
// applies to API responses, using FIXTURES above. Example:
// ---------------------------------------------------------------------------

test("fixture has the documented shape", () => {
    assert.ok(Array.isArray(FIXTURE_LIST_RESPONSE.items));
    assert.equal(typeof FIXTURE_LIST_RESPONSE.total, "number");
});
