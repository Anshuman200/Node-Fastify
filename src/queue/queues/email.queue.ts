import { Queue, ConnectionOptions, JobsOptions } from "bullmq";
import { EmailJobData } from "../types.js";

/**
 * 📧 Email Queue
 */

export const EMAIL_QUEUE_NAME = "email-queue";

export const createEmailQueue = (connection: ConnectionOptions) =>
  new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
    connection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 3000,
      },

      removeOnComplete: true,

      removeOnFail: {
        count: 100,
      },
    },
  });

/**
 * 📤 Add Email Job
 */
export const addEmailJob = async (
  queue: Queue<EmailJobData>,
  data: EmailJobData,
  options?: JobsOptions
) => {
  return queue.add("send-email", data, {
    priority: options?.priority ?? 1, // 🔥 high priority
    delay: options?.delay ?? 0,

    // 🔥 Deduplication strategy
    jobId:
      options?.jobId ??
      `${data.type}-${data.to}-${Date.now()}`,

    ...options,
  });
};