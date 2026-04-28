const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const roleData = [
    { code: "WAITER", name: "Официант" },
    { code: "CHEF", name: "Повар" },
    { code: "ADMIN", name: "Администратор" },
    { code: "MANAGER", name: "Управляющий" }
  ];

  for (const role of roleData) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role
    });
  }

  const statuses = [
    { code: "ACCEPTED", name: "Принят" },
    { code: "IN_PROGRESS", name: "Готовится" },
    { code: "READY", name: "Готов" },
    { code: "SERVED", name: "Подан" },
    { code: "CLOSED", name: "Закрыт" }
  ];

  for (const status of statuses) {
    await prisma.orderStatus.upsert({
      where: { code: status.code },
      update: status,
      create: status
    });
  }

  const paymentMethods = [
    { code: "CASH", name: "Наличные" },
    { code: "CARD", name: "Карта" }
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: method,
      create: method
    });
  }

  const categories = [{ name: "Кофе" }, { name: "Чай" }, { name: "Десерты" }];

  for (const category of categories) {
    await prisma.menuCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
  }

  for (let i = 1; i <= 10; i += 1) {
    await prisma.cafeTable.upsert({
      where: { number: i },
      update: { seats: i <= 4 ? 2 : 4 },
      create: { number: i, seats: i <= 4 ? 2 : 4 }
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: "ADMIN" } });
  const adminHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@calipso.coffee" },
    update: { passwordHash: adminHash, roleId: adminRole.id },
    create: {
      fullName: "Системный администратор",
      email: "admin@calipso.coffee",
      passwordHash: adminHash,
      roleId: adminRole.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
