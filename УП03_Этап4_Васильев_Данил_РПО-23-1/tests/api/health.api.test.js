"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../../src/app");

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe("API /health", () => {
  it("GET /health возвращает 200 и status ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "calipso-coffee-api");
  });
});
