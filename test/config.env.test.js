"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const envModulePath = require.resolve("../src/config/env.js");

function loadEnvFresh() {
  delete require.cache[envModulePath];
  return require("../src/config/env.js");
}

describe("config/env", () => {
  let snapshot;

  beforeEach(() => {
    snapshot = {
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL
    };
  });

  afterEach(() => {
    for (const key of Object.keys(snapshot)) {
      const v = snapshot[key];
      if (v === undefined) delete process.env[key];
      else process.env[key] = v;
    }
    delete require.cache[envModulePath];
  });

  it("PORT из окружения приводится к числу", () => {
    process.env.PORT = "7777";
    const { env } = loadEnvFresh();
    assert.equal(env.port, 7777);
    assert.equal(typeof env.port, "number");
  });

  it("JWT_SECRET можно переопределить через окружение", () => {
    process.env.JWT_SECRET = "test_secret_value";
    const { env } = loadEnvFresh();
    assert.equal(env.jwtSecret, "test_secret_value");
  });

  it("databaseUrl содержит схему для SQLite по умолчанию при отсутствии DATABASE_URL", () => {
    delete process.env.DATABASE_URL;
    const { env } = loadEnvFresh();
    assert.ok(
      typeof env.databaseUrl === "string" && env.databaseUrl.length > 0,
      "databaseUrl не пустая строка"
    );
    assert.ok(
      env.databaseUrl.includes("dev.db") || env.databaseUrl.startsWith("file:"),
      "ожидается SQLite file URL из значения по умолчанию"
    );
  });
});
