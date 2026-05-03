const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

const ingredientSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  stockAmount: z.number().nonnegative()
});

const recipeItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  ingredientId: z.number().int().positive(),
  amount: z.number().positive()
});

router.get("/ingredients", async (_req, res) => {
  const rows = await prisma.ingredient.findMany({
    orderBy: { name: "asc" }
  });
  return res.json(rows);
});

router.post("/ingredients", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const data = ingredientSchema.parse(req.body);
    const row = await prisma.ingredient.create({ data });
    return res.status(201).json(row);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Не удалось создать ингредиент" });
  }
});

router.patch("/ingredients/:id", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const data = ingredientSchema.partial().parse(req.body);
    const row = await prisma.ingredient.update({ where: { id }, data });
    return res.json(row);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Не удалось обновить ингредиент" });
  }
});

router.get("/recipes", async (_req, res) => {
  const rows = await prisma.recipeItem.findMany({
    include: {
      menuItem: true,
      ingredient: true
    },
    orderBy: { id: "desc" }
  });
  return res.json(rows);
});

router.post("/recipes", allowRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const data = recipeItemSchema.parse(req.body);
    const row = await prisma.recipeItem.upsert({
      where: { menuItemId_ingredientId: { menuItemId: data.menuItemId, ingredientId: data.ingredientId } },
      create: data,
      update: { amount: data.amount }
    });
    return res.status(201).json(row);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Не удалось добавить рецепт позиции" });
  }
});

module.exports = { inventoryRouter: router };
