"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const {
  mutationCooldown,
  loginAttemptLimiter,
  registerLoginFailure,
  clearLoginFailures,
  resetRateLimitStoresForTests
} = require("../src/middleware/security");

function mockRes() {
  return {
    statusCode: 200,
    status(n) {
      this.statusCode = n;
      return this;
    },
    body: undefined,
    json(o) {
      this.body = o;
      return this;
    }
  };
}

describe("middleware/security", () => {
  beforeEach(() => {
    resetRateLimitStoresForTests();
  });

  it("mutationCooldown пропускает GET без ограничений", () => {
    const req = { method: "GET", path: "/api/orders", ip: "127.0.0.1" };
    const res = mockRes();
    let nextCalled = false;
    mutationCooldown(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
  });

  it("mutationCooldown вызывает next для первого POST", () => {
    const req = { method: "POST", path: "/api/orders", ip: "192.168.1.1" };
    const res = mockRes();
    let nextCalled = false;
    mutationCooldown(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
  });

  it("mutationCooldown возвращает 429 при повторном POST в том же окне", () => {
    const req = { method: "POST", path: "/api/orders", ip: "10.0.0.5" };
    const res1 = mockRes();
    mutationCooldown(req, res1, () => {});

    const res2 = mockRes();
    let secondNext = false;
    mutationCooldown(req, res2, () => {
      secondNext = true;
    });

    assert.equal(secondNext, false);
    assert.equal(res2.statusCode, 429);
    assert.ok(String(res2.body?.error || "").includes("Слишком частые"));
  });

  it("loginAttemptLimiter выставляет ключ и вызывает next", () => {
    const req = { ip: "203.0.113.7" };
    const res = mockRes();
    let nextCalled = false;
    loginAttemptLimiter(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(req.loginLimiterKey, "login:203.0.113.7");
  });

  it("registerLoginFailure накапливает попытки и блокирует после порога", () => {
    const key = "login:test-ip-block";
    clearLoginFailures(key);

    for (let i = 0; i < 4; i++) {
      registerLoginFailure(key);
    }

    const req = { ip: "test-ip-block" };
    const resOk = mockRes();
    let okNext = false;
    loginAttemptLimiter(req, resOk, () => {
      okNext = true;
    });
    assert.equal(okNext, true);

    registerLoginFailure(key);

    const resBlocked = mockRes();
    let blockedNext = false;
    loginAttemptLimiter(req, resBlocked, () => {
      blockedNext = true;
    });
    assert.equal(blockedNext, false);
    assert.equal(resBlocked.statusCode, 429);
  });
});
