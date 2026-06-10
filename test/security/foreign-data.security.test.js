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
let waiterAToken;
let waiterBToken;
let foreignOrderId;

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

  const waiterRole = await prisma.role.findUniqueOrThrow({ where: { code: "WAITER" } });
  const hash = await bcrypt.hash("testpass", 10);
  const status = await prisma.orderStatus.findUniqueOrThrow({ where: { code: "ACCEPTED" } });
  const table = await prisma.cafeTable.findFirstOrThrow();
  let menuItem = await prisma.menuItem.findFirst();
  if (!menuItem) {
    const category = await prisma.menuCategory.findFirstOrThrow();
    menuItem = await prisma.menuItem.create({
      data: { name: "Тест кофе", price: 150, categoryId: category.id, isAvailable: true }
    });
  }

  const userA = await prisma.user.upsert({
    where: { email: "sec-waiter-a@test.local" },
    update: { passwordHash: hash, roleId: waiterRole.id },
    create: {
      fullName: "Waiter A",
      email: "sec-waiter-a@test.local",
      passwordHash: hash,
      roleId: waiterRole.id
    }
  });
  const userB = await prisma.user.upsert({
    where: { email: "sec-waiter-b@test.local" },
    update: { passwordHash: hash, roleId: waiterRole.id },
    create: {
      fullName: "Waiter B",
      email: "sec-waiter-b@test.local",
      passwordHash: hash,
      roleId: waiterRole.id
    }
  });

  const order = await prisma.order.create({
    data: {
      userId: userB.id,
      tableId: table.id,
      statusId: status.id,
      orderItems: {
        create: {
          menuItemId: menuItem.id,
          quantity: 1,
          unitPrice: menuItem.price
        }
      }
    }
  });
  foreignOrderId = order.id;

  waiterAToken = tokenFor(userA);
  waiterBToken = tokenFor(userB);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  const emails = ["sec-waiter-a@test.local", "sec-waiter-b@test.local"];
  const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const userIds = users.map((u) => u.id);
  if (userIds.length) {
    const orders = await prisma.order.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length) {
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
  await prisma.$disconnect();
});

test("официант видит свой заказ", async () => {
  const res = await request("GET", `/api/orders/${foreignOrderId}`, { token: waiterBToken });
  assert.equal(res.status, 200);
});

test("официант не видит чужой заказ (403)", async () => {
  const res = await request("GET", `/api/orders/${foreignOrderId}`, { token: waiterAToken });
  assert.equal(res.status, 403);
  assert.match(res.body.error, /запрещён/i);
});

test("официант не может менять статус чужого заказа", async () => {
  const res = await request("PATCH", `/api/orders/${foreignOrderId}/status`, {
    token: waiterAToken,
    body: { statusCode: "IN_PROGRESS" }
  });
  assert.equal(res.status, 403);
});
