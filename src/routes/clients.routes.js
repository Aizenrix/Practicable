const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

const clientSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(30).optional(),
  notes: z.string().trim().max(500).optional()
});

router.get("/", async (_req, res) => {
  const rows = await prisma.client.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" }
  });
  return res.json(rows);
});

router.post("/", allowRoles("WAITER", "ADMIN", "MANAGER"), async (req, res) => {
  try {
    const data = clientSchema.parse(req.body);
    const row = await prisma.client.create({ data });
    return res.status(201).json(row);
  } catch (error) {
    return res.status(400).json({ error: "Не удалось создать клиента" });
  }
});

router.patch("/:id", allowRoles("WAITER", "ADMIN", "MANAGER"), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const data = clientSchema.partial().parse(req.body);
    const row = await prisma.client.update({ where: { id }, data });
    return res.json(row);
  } catch (error) {
    return res.status(400).json({ error: "Не удалось обновить клиента" });
  }
});

module.exports = { clientsRouter: router };
