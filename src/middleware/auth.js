const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { prisma } = require("../lib/prisma");

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Пользователь неактивен или не найден" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Неверный токен" });
  }
}

function allowRoles(...allowed) {
  return (req, res, next) => {
    const roleCode = req.user?.role?.code;
    if (!roleCode || !allowed.includes(roleCode)) {
      return res.status(403).json({ error: "Недостаточно прав доступа" });
    }
    return next();
  };
}

module.exports = { authRequired, allowRoles };
