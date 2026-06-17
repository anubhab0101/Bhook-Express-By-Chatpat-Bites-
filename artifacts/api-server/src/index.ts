import { loadLocalEnv } from "./lib/loadEnv";
import app from "./app";
import { startKeepAlive } from "./lib/keepAlive";
import { logger } from "./lib/logger";

loadLocalEnv();

const rawPort = process.env["PORT"] || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startKeepAlive();
});
