import { Worker, Job, ConnectionOptions } from "bullmq";
import { FastifyBaseLogger } from "fastify";
import { AnalyticsJobData } from "../types.js";

/**
 * 📊 Analytics Worker (Production Hardened)
 */
export const createAnalyticsWorker = (
  connection: ConnectionOptions,
  logger: FastifyBaseLogger
) => {
  const worker = new Worker<AnalyticsJobData>(
    "analytics-queue",
    async (job: Job<AnalyticsJobData>) => {
      const { event, userId } = job.data;

      try {
        await withTimeout(processAnalyticsJob(job.data), 5000); // 5s timeout
        logger.debug({ msg: "Analytics processed", jobId: job.id, event, userId });
      } catch (err: any) {
        // Analytics failures are usually non-critical, we log but don't always retry if high volume
        logger.error({ msg: "Analytics job failed", jobId: job.id, error: err.message });
      }
    },
    {
      connection,
      concurrency: 20,
      lockDuration: 30000,
    }
  );

  return worker;
};

async function processAnalyticsJob(data: AnalyticsJobData) {
  // logic (DB write, Kafka push, etc.)
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Analytics job timeout")), ms)
    ),
  ]);
}