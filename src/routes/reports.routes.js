const express = require("express");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = require("express").Router();
router.use(authRequired);
router.use(allowRoles("ADMIN", "MANAGER"));

router.get("/summary", async (_req, res) => {
  const [ordersCount, openOrdersCount, payments, topItems] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { closedAt: null } }),
    prisma.payment.findMany(),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5
    })
  ]);

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const detailedTop = await Promise.all(
    topItems.map(async (entry) => {
      const item = await prisma.menuItem.findUnique({ where: { id: entry.menuItemId } });
      return {
        menuItemId: entry.menuItemId,
        name: item?.name || "Unknown",
        quantity: entry._sum.quantity || 0
      };
    })
  );

  return res.json({
    ordersCount,
    openOrdersCount,
    revenue,
    topItems: detailedTop
  });
});

router.get("/orders-by-status", async (_req, res) => {
  const statuses = await prisma.orderStatus.findMany({ orderBy: { id: "asc" } });
  const result = await Promise.all(statuses.map(async (s) => ({
    statusCode: s.code,
    statusName: s.name,
    count: await prisma.order.count({ where: { statusId: s.id } })
  })));
  return res.json(result);
});

router.get("/tables-load", async (_req, res) => {
  const rows = await prisma.cafeTable.findMany({
    include: {
      _count: { select: { orders: true } }
    },
    orderBy: { number: "asc" }
  });
  return res.json(rows.map((t) => ({
    tableId: t.id,
    number: t.number,
    seats: t.seats,
    isOccupied: t.isOccupied,
    ordersCount: t._count.orders
  })));
});

module.exports = { reportsRouter: router };
