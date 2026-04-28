const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

const categorySchema = z.object({
  name: z.string().min(2),
  isActive: z.boolean().optional()
});

const menuItemSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  description: z.string().optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.number().int().positive()
});

router.get("/categories", async (_req, res) => {
  const rows = await prisma.menuCategory.findMany({
    include: { items: true },
    orderBy: { name: "asc" }
  });
  return res.json(rows);
});

router.post("/categories", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const data = categorySchema.parse(req.body);
    const row = await prisma.menuCategory.create({ data });
    return res.status(201).json(row);
  } catch (error) {
    return res.status(400).json({ error: "Не удалось создать категорию" });
  }
});

router.get("/items", async (_req, res) => {
  const rows = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }]
  });
  return res.json(rows);
});

router.post("/items", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const data = menuItemSchema.parse(req.body);
    const row = await prisma.menuItem.create({ data });
    return res.status(201).json(row);
  } catch (error) {
    return res.status(400).json({ error: "Не удалось создать позицию меню" });
  }
});

router.patch("/items/:id/availability", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  const id = Number(req.params.id);
  const isAvailable = Boolean(req.body?.isAvailable);
  const row = await prisma.menuItem.update({ where: { id }, data: { isAvailable } });
  return res.json(row);
});

module.exports = { menuRouter: router };
