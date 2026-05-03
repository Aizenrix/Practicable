const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.get("/", allowRoles("WAITER", "ADMIN", "MANAGER"), async (_req, res) => {
  const rows = await prisma.payment.findMany({
    include: {
      order: {
        include: {
          table: true
        }
      },
      paymentMethod: true
    },
    orderBy: { paidAt: "desc" }
  });
  return res.json(rows);
});

const paymentSchema = z.object({
  orderId: z.number().int().positive(),
  paymentMethodCode: z.string().min(2),
  transactionCode: z.string().optional()
});

router.post("/", allowRoles("WAITER", "ADMIN", "MANAGER"), async (req, res) => {
  try {
    const parsed = paymentSchema.parse(req.body);
    const order = await prisma.order.findUnique({
      where: { id: parsed.orderId },
      include: { payment: true }
    });
    if (!order) return res.status(404).json({ error: "Заказ не найден" });
    if (order.payment) return res.status(409).json({ error: "Оплата уже зарегистрирована" });

    const method = await prisma.paymentMethod.findUnique({
      where: { code: parsed.paymentMethodCode }
    });
    if (!method) return res.status(404).json({ error: "Способ оплаты не найден" });

    const payment = await prisma.payment.create({
      data: {
        orderId: parsed.orderId,
        paymentMethodId: method.id,
        amount: order.totalAmount,
        transactionCode: parsed.transactionCode
      },
      include: { paymentMethod: true }
    });

    return res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Не удалось зарегистрировать оплату" });
  }
});

module.exports = { paymentsRouter: router };
