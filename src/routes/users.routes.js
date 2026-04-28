const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);
router.use(allowRoles("ADMIN", "MANAGER"));

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleCode: z.string().min(2)
});

router.get("/", async (_req, res) => {
  const rows = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(rows.map((u) => ({ ...u, passwordHash: undefined })));
});

router.post("/", async (req, res) => {
  try {
    const parsed = createUserSchema.parse(req.body);
    const role = await prisma.role.findUnique({ where: { code: parsed.roleCode } });
    if (!role) return res.status(404).json({ error: "Роль не найдена" });

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        passwordHash,
        roleId: role.id
      },
      include: { role: true }
    });
    return res.status(201).json({ ...user, passwordHash: undefined });
  } catch (error) {
    return res.status(400).json({ error: "Не удалось создать пользователя" });
  }
});

module.exports = { usersRouter: router };
