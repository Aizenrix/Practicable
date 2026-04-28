const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authRequired, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

const createOrderSchema = z.object({
  tableId: z.number().int().positive(),
  clientId: z.number().int().positive().optional(),
  comment: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      note: z.string().optional()
    })
  ).min(1)
});

async function recalcOrderTotal(orderId) {
  const rows = await prisma.orderItem.findMany({ where: { orderId } });
  const totalAmount = rows.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
  await prisma.order.update({ where: { id: orderId }, data: { totalAmount } });
  return totalAmount;
}

router.post("/", allowRoles("WAITER", "ADMIN", "MANAGER"), async (req, res) => {
  try {
    const parsed = createOrderSchema.parse(req.body);
    const acceptedStatus = await prisma.orderStatus.findUniqueOrThrow({
      where: { code: "ACCEPTED" }
    });

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          clientId: parsed.clientId,
          tableId: parsed.tableId,
          statusId: acceptedStatus.id,
          comment: parsed.comment
        }
      });

      for (const item of parsed.items) {
        const menuItem = await tx.menuItem.findUniqueOrThrow({ where: { id: item.menuItemId } });
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note,
            unitPrice: menuItem.price
          }
        });
      }

      await tx.cafeTable.update({ where: { id: parsed.tableId }, data: { isOccupied: true } });
      return order;
    });

    const totalAmount = await recalcOrderTotal(created.id);
    const fullOrder = await prisma.order.findUnique({
      where: { id: created.id },
      include: {
        table: true,
        status: true,
        orderItems: { include: { menuItem: true } },
        user: { include: { role: true } }
      }
    });
    return res.status(201).json({ ...fullOrder, totalAmount });
  } catch (error) {
    return res.status(400).json({ error: "Не удалось создать заказ" });
  }
});

router.get("/", async (req, res) => {
  const onlyOpen = req.query.onlyOpen === "true";
  const rows = await prisma.order.findMany({
    where: onlyOpen ? { closedAt: null } : undefined,
    include: {
      table: true,
      status: true,
      payment: { include: { paymentMethod: true } },
      orderItems: { include: { menuItem: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return res.json(rows);
});

router.patch("/:id/status", allowRoles("WAITER", "CHEF", "ADMIN", "MANAGER"), async (req, res) => {
  const id = Number(req.params.id);
  const { statusCode } = req.body;
  if (!statusCode) {
    return res.status(400).json({ error: "statusCode обязателен" });
  }

  const status = await prisma.orderStatus.findUnique({ where: { code: String(statusCode) } });
  if (!status) return res.status(404).json({ error: "Статус не найден" });

  const data = { statusId: status.id };
  if (status.code === "CLOSED") {
    data.closedAt = new Date();
  }

  const updated = await prisma.order.update({ where: { id }, data });

  if (status.code === "CLOSED") {
    await prisma.cafeTable.update({
      where: { id: updated.tableId },
      data: { isOccupied: false }
    });
  }

  return res.json(updated);
});

module.exports = { ordersRouter: router };
