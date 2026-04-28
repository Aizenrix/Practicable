const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("node:path");
const { env } = require("./config/env");
const { authRouter } = require("./routes/auth.routes");
const { usersRouter } = require("./routes/users.routes");
const { referenceRouter } = require("./routes/reference.routes");
const { menuRouter } = require("./routes/menu.routes");
const { ordersRouter } = require("./routes/orders.routes");
const { paymentsRouter } = require("./routes/payments.routes");
const { reportsRouter } = require("./routes/reports.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "calipso-coffee-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/reference", referenceRouter);
app.use("/api/menu", menuRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(env.port, () => {
  console.log(`Calipso.Coffee API запущен на порту ${env.port}`);
});
