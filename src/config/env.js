const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change_me",
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  nodeEnv,
  isProduction,
  appDebug: process.env.APP_DEBUG === "true" || (!isProduction && process.env.APP_DEBUG !== "false"),
  corsOrigin: process.env.CORS_ORIGIN || (isProduction ? "http://localhost:4000" : "*")
};

module.exports = { env };
