import { Worker, Job, ConnectionOptions } from "bullmq";
import { FastifyBaseLogger } from "fastify";
import { NotificationJobData } from "../types.js";

/**
 * 🔔 Notification Worker (Production Hardened)
 */
export const createNotificationWorker = (
  connection: ConnectionOptions,
  logger: FastifyBaseLogger
) => {
  const worker = new Worker<NotificationJobData>(
    "notification-queue",
    async (job: Job<NotificationJobData>) => {
      const start = Date.now();
      const { userId, type, title, body } = job.data;

      if (!userId || !type) throw new Error("Invalid notification payload");

      try {
        await withTimeout(
          processNotificationJob({ userId, type, title, body }),
          10000 // 10s timeout
        );

        logger.info({
          msg: "Notification sent",
          jobId: job.id,
          type,
          duration: Date.now() - start,
        });
      } catch (err: any) {
        logger.error({ msg: "Notification failed", jobId: job.id, error: err.message });
        throw err;
      }
    },
    {
      connection,
      concurrency: 10,
      lockDuration: 30000,
    }
  );

  worker.on("failed", (job, err) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
      logger.error({ msg: "❌ Notification exhausted retries", jobId: job.id, error: err.message });
    }
  });

  return worker;
};

async function processNotificationJob(data: NotificationJobData) {
  // logic (Twilio, Firebase, etc.)
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Job timeout")), ms)
    ),
  ]);
}