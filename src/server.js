const { env } = require("./config/env");
const { createApp } = require("./app");

const app = createApp();

app.listen(env.port, () => {
  console.log(`Calipso.Coffee API запущен на порту ${env.port}`);
});
