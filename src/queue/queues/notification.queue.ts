import { Queue, ConnectionOptions, JobsOptions } from "bullmq";
import { NotificationJobData } from "../types.js";

/**
 * 🔔 Notification Queue
 */

export const NOTIFICATION_QUEUE_NAME = "notification-queue";

export const createNotificationQueue = (connection: ConnectionOptions) =>
  new Queue<NotificationJobData>(NOTIFICATION_QUEUE_NAME, {
    connection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 2000,
      },

      removeOnComplete: true,

      removeOnFail: {
        count: 500,
      },
    },
  });

/**
 * 📤 Add Notification Job
 */
export const addNotificationJob = async (
  queue: Queue<NotificationJobData>,
  data: NotificationJobData,
  options?: JobsOptions
) => {
  return queue.add("send-notification", data, {
    priority: options?.priority ?? 2, // medium
    delay: options?.delay ?? 0,

    jobId:
      options?.jobId ??
      `${data.type}-${data.userId}-${Date.now()}`,

    ...options,
  });
};