#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const BASE = process.env.API_BASE_URL || "http://localhost:4000";
const reportsDir = path.join(__dirname, "..", "reports");
const outFile = path.join(reportsDir, "api_test_report.txt");

fs.mkdirSync(reportsDir, { recursive: true });

const lines = [];
function log(line) {
  lines.push(line);
  console.log(line);
}

async function request(method, urlPath, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const started = Date.now();
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const ms = Date.now() - started;
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { status: res.status, ms, data };
}

async function main() {
  log(`Calipso.Coffee API test report`);
  log(`Base URL: ${BASE}`);
  log(`Date: ${new Date().toISOString()}`);
  log("");

  const health = await request("GET", "/health");
  log(`[OK] GET /health -> ${health.status} (${health.ms} ms)`);

  const badLogin = await request("POST", "/api/auth/login", {
    email: "admin@calipso.coffee",
    password: "wrong_password"
  });
  log(`[ERR-OK] POST /api/auth/login wrong password -> ${badLogin.status} (${badLogin.ms} ms)`);

  const login = await request("POST", "/api/auth/login", {
    email: "admin@calipso.coffee",
    password: "admin123"
  });
  log(`[OK] POST /api/auth/login -> ${login.status} (${login.ms} ms)`);

  const menu = await request("GET", "/api/menu/items", null, login.data.token);
  log(`[OK] GET /api/menu/items -> ${menu.status} (${menu.ms} ms)`);

  const unknown = await request("GET", "/api/unknown-route-test");
  log(`[ERR-OK] GET /api/unknown-route-test -> ${unknown.status} (${unknown.ms} ms)`);

  log("");
  log("Node test suite:");
  const testRun = spawnSync("npm", ["test"], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8"
  });
  log(testRun.stdout || "");
  if (testRun.stderr) log(testRun.stderr);

  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  log("");
  log(`Saved: ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
