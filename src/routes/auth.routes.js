const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { env } = require("../config/env");
const { authRequired } = require("../middleware/auth");
const {
  loginAttemptLimiter,
  registerLoginFailure,
  clearLoginFailures
} = require("../middleware/security");

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6)
});

router.post("/login", loginAttemptLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      registerLoginFailure(req.loginLimiterKey);
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      registerLoginFailure(req.loginLimiterKey);
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    clearLoginFailures(req.loginLimiterKey);

    const token = jwt.sign(
      { userId: user.id, role: user.role.code },
      env.jwtSecret,
      { expiresIn: "12h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Ошибка валидации", details: error.issues });
    }
    return res.status(500).json({ error: "Ошибка авторизации" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  return res.json({
    id: req.user.id,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = { authRouter: router };
