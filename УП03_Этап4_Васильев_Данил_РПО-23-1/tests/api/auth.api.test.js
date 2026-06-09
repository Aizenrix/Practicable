"use strict";

const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../../src/app");
const { resetRateLimitStoresForTests } = require("../../src/middleware/security");

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

beforeEach(() => {
  resetRateLimitStoresForTests();
});

describe("API /api/auth", () => {
  it("POST /login с неверным паролем возвращает 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@calipso.coffee", password: "wrong_password" })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.ok(body.error);
  });

  it("GET /me без токена возвращает 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /авторизац/i);
  });

  it("POST /login с валидными данными возвращает token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@calipso.coffee", password: "admin123" })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.token);
    assert.ok(body.user?.email);
  });
});

describe("API unknown route", () => {
  it("GET /api/unknown возвращает 404 JSON", async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route-test`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, "Маршрут API не найден");
  });
});
