import { FastifyInstance } from "fastify";
import { AnalyticsJobData, JobPriority } from "../types.js";
import { isQueueOverloaded } from "../../utils/queue/metrics.util.js";

/**
 * 📊 Add Analytics Job Helper (Production Hardened)
 */
export const addAnalyticsJob = async (
  app: FastifyInstance,
  data: AnalyticsJobData,
  options?: {
    priority?: JobPriority;
    delay?: number;
    jobId?: string;
  }
) => {
  try {
    // 🛡️ Backpressure Guard (Dropped if Redis is overwhelmed)
    if (await isQueueOverloaded(app.queues.analytics, 50000)) {
      app.log.warn({ msg: "📊 Analytics dropped (Backpressure)", event: data.event });
      return null;
    }

    return await app.queues.analytics.add("log-analytics", data, {
      priority: options?.priority || JobPriority.LOW,
      delay: options?.delay || 0,
      jobId: options?.jobId ?? `analytics-${data.event}-${data.userId ?? "anon"}-${Date.now()}`,
      removeOnComplete: true,
      removeOnFail: true,
    });
  } catch (error: any) {
    app.log.error({ msg: "📊 Analytics enqueue failed", error: error.message });
    return null;
  }
};
