"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../../src/app");
const { resetRateLimitStoresForTests } = require("../../src/middleware/security");

let server;
let baseUrl;
let token;

before(async () => {
  resetRateLimitStoresForTests();
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@calipso.coffee", password: "admin123" })
  });
  const data = await login.json();
  token = data.token;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe("Smoke: основные API после авторизации", () => {
  it("GET /api/menu/items возвращает 200", async () => {
    const res = await fetch(`${baseUrl}/api/menu/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(res.status, 200);
    const rows = await res.json();
    assert.ok(Array.isArray(rows));
  });

  it("GET /api/reports/summary возвращает 200", async () => {
    const res = await fetch(`${baseUrl}/api/reports/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.ordersCount === "number");
  });
});
