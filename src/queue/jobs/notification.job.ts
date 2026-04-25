import { FastifyInstance } from "fastify";
import { NotificationJobData, JobPriority } from "../types.js";
import { isQueueOverloaded } from "../../utils/queue/metrics.util.js";

/**
 * 🔔 Add Notification Job Helper (Harden)
 */
export const addNotificationJob = async (
  app: FastifyInstance,
  data: NotificationJobData,
  options?: {
    priority?: JobPriority;
    delay?: number;
    jobId?: string;
  }
) => {
  try {
    if (await isQueueOverloaded(app.queues.notification, 10000)) {
      app.log.warn("⚠️ Notification Queue Overloaded");
    }

    return await app.queues.notification.add("send-notification", data, {
      priority: options?.priority || JobPriority.MEDIUM,
      delay: options?.delay || 0,
      jobId: options?.jobId ?? `notify-${data.type}-${data.userId}-${Date.now()}`,
      removeOnComplete: true,
      removeOnFail: { count: 500 }
    });
  } catch (error: any) {
    app.log.error({ msg: "🔥 Notification enqueue failed", error: error.message });
    return null;
  }
};
