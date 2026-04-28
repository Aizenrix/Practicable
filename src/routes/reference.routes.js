const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);

router.get("/roles", async (_req, res) => {
  const rows = await prisma.role.findMany({ orderBy: { id: "asc" } });
  return res.json(rows);
});

router.get("/statuses", async (_req, res) => {
  const rows = await prisma.orderStatus.findMany({ orderBy: { id: "asc" } });
  return res.json(rows);
});

router.get("/payment-methods", async (_req, res) => {
  const rows = await prisma.paymentMethod.findMany({ orderBy: { id: "asc" } });
  return res.json(rows);
});

router.get("/tables", async (_req, res) => {
  const rows = await prisma.cafeTable.findMany({ orderBy: { number: "asc" } });
  return res.json(rows);
});

const tableSchema = z.object({
  number: z.number().int().positive(),
  seats: z.number().int().positive(),
  description: z.string().optional()
});

router.post("/tables", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const data = tableSchema.parse(req.body);
    const row = await prisma.cafeTable.create({ data });
    return res.status(201).json(row);
  } catch (error) {
    return res.status(400).json({ error: "Не удалось создать стол" });
  }
});

router.patch("/tables/:id/occupancy", allowRoles("ADMIN", "MANAGER", "WAITER"), async (req, res) => {
  const id = Number(req.params.id);
  const isOccupied = Boolean(req.body?.isOccupied);
  const row = await prisma.cafeTable.update({
    where: { id },
    data: { isOccupied }
  });
  return res.json(row);
});

module.exports = { referenceRouter: router };
