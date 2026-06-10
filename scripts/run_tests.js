#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function collectTests(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "load") continue;
      collectTests(full, files);
    } else if (entry.name.endsWith(".test.js")) {
      files.push(full);
    }
  }
  return files;
}

const files = collectTests(path.join(__dirname, "..", "test")).sort();
if (!files.length) {
  console.error("No test files found");
  process.exit(1);
}

const args = ["--test", ...files];
const result = spawnSync(process.execPath, args, { stdio: "inherit" });
process.exit(result.status ?? 1);
