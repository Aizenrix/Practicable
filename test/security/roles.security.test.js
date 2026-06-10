const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const { createApp } = require("../../src/app");
const { prisma } = require("../../src/lib/prisma");
const { env } = require("../../src/config/env");
const bcrypt = require("bcryptjs");
const { resetRateLimitStoresForTests } = require("../../src/middleware/security");

let server;
let baseUrl;
let adminToken;
let waiterToken;

function request(method, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { "Content-Type": "application/json" }
    };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : null;
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, body: json });
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function tokenFor(user) {
  return jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: "1h" });
}

before(async () => {
  resetRateLimitStoresForTests();
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: "ADMIN" } });
  const waiterRole = await prisma.role.findUniqueOrThrow({ where: { code: "WAITER" } });
  const hash = await bcrypt.hash("testpass", 10);

  await prisma.user.upsert({
    where: { email: "sec-admin@test.local" },
    update: { passwordHash: hash, roleId: adminRole.id },
    create: {
      fullName: "Sec Admin",
      email: "sec-admin@test.local",
      passwordHash: hash,
      roleId: adminRole.id
    }
  });
  await prisma.user.upsert({
    where: { email: "sec-waiter@test.local" },
    update: { passwordHash: hash, roleId: waiterRole.id },
    create: {
      fullName: "Sec Waiter",
      email: "sec-waiter@test.local",
      passwordHash: hash,
      roleId: waiterRole.id
    }
  });

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: "sec-admin@test.local" },
    include: { role: true }
  });
  const waiterUser = await prisma.user.findUniqueOrThrow({
    where: { email: "sec-waiter@test.local" },
    include: { role: true }
  });
  adminToken = tokenFor(adminUser);
  waiterToken = tokenFor(waiterUser);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.user.deleteMany({
    where: { email: { in: ["sec-admin@test.local", "sec-waiter@test.local"] } }
  });
  await prisma.$disconnect();
});

test("ADMIN может получить список пользователей", async () => {
  const res = await request("GET", "/api/users", { token: adminToken });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test("WAITER не имеет доступа к /api/users (admin-раздел)", async () => {
  const res = await request("GET", "/api/users", { token: waiterToken });
  assert.equal(res.status, 403);
  assert.match(res.body.error, /прав/i);
});
