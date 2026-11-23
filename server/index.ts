import { app } from "./app";
import { config } from "./config";
import { db } from "./db";

const server = app.listen(config.PORT, () => {
  console.log(`NexusGamer API: http://localhost:${config.PORT}/api`);
  console.log(`OpenAPI UI: http://localhost:${config.PORT}/api/docs`);
});

async function shutdown(signal: string) {
  console.log(`${signal}: cerrando conexiones`);
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
