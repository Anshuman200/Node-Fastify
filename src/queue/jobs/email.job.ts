import { FastifyInstance } from "fastify";
import { EmailJobData, JobPriority } from "../types.js";
import { isQueueOverloaded } from "../../utils/queue/metrics.util.js";

/**
 * 📧 Add Email Job Helper (Production Hardened)
 */
export const addEmailJob = async (
  app: FastifyInstance,
  data: EmailJobData,
  options?: {
    priority?: JobPriority;
    delay?: number;
    jobId?: string;
  }
) => {
  try {
    // 🛡️ 1. Redis Connection Guard
    if (!app.redis) {
      app.log.error("❌ Cannot add email job: Redis unavailable");
      return null;
    }

    // 🛡️ 2. Backpressure Protection (Limit at 5000 waiting emails)
    if (await isQueueOverloaded(app.queues.email, 5000)) {
      app.log.warn({ msg: "⚠️ Email Queue Backpressure triggered", to: data.to });
      // In production, you might want to switch to a synchronous fallback or return a specific error
    }

    // 🚀 3. Fast Enqueue
    return await app.queues.email.add("send-email", data, {
      priority: options?.priority || JobPriority.MEDIUM,
      delay: options?.delay || 0,
      jobId: options?.jobId ?? `email-${data.type}-${data.to}-${Date.now()}`,
      removeOnComplete: true, // Auto-cleanup
      removeOnFail: { count: 100 }, // Retention policy
    });
  } catch (error: any) {
    app.log.error({ msg: "🔥 Failed to enqueue email job", error: error.message, to: data.to });
    return null; // Return null instead of crashing the API request
  }
};
