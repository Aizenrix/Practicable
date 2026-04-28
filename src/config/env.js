const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change_me",
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db"
};

module.exports = { env };
