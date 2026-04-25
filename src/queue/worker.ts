import "dotenv/config";
import pino from "pino";
import { createWorkerConnection } from "./connection.js";
import { createEmailWorker } from "./workers/email.worker.js";
import { createNotificationWorker } from "./workers/notification.worker.js";
import { createAnalyticsWorker } from "./workers/analytics.worker.js";

/**
 * 🚜 Worker Process (Production Ready)
 */

const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
});

const connection = createWorkerConnection();

const workers = [
  createEmailWorker(connection, logger),
  createNotificationWorker(connection, logger),
  createAnalyticsWorker(connection, logger),
];

logger.info("🚀 BullMQ Workers Started");

/**
 * 🛑 Graceful Shutdown
 */
const shutdown = async (signal: string) => {
  logger.info(`Shutting down workers: ${signal}`);

  try {
    await Promise.all(workers.map((w) => w.close()));
    await connection.quit();
    logger.info("Workers shut down cleanly");
    process.exit(0);
  } catch (err: any) {
    logger.error("Shutdown error", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * ⚠️ Global Error Handling
 */
process.on("uncaughtException", (err: any) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  logger.error("Unhandled Rejection", err);
  process.exit(1);
});