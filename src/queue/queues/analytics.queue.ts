import { Queue, ConnectionOptions, JobsOptions } from "bullmq";
import { AnalyticsJobData } from "../types.js";

/**
 * 📊 Analytics Queue
 */

export const ANALYTICS_QUEUE_NAME = "analytics-queue";

export const createAnalyticsQueue = (connection: ConnectionOptions) =>
  new Queue<AnalyticsJobData>(ANALYTICS_QUEUE_NAME, {
    connection,

    defaultJobOptions: {
      attempts: 1, // fire-and-forget

      removeOnComplete: true,

      removeOnFail: {
        count: 1000,
      },
    },
  });

/**
 * 📤 Add Analytics Job
 */
export const addAnalyticsJob = async (
  queue: Queue<AnalyticsJobData>,
  data: AnalyticsJobData,
  options?: JobsOptions
) => {
  return queue.add("track-event", data, {
    priority: options?.priority ?? 3, // low
    delay: options?.delay ?? 0,

    jobId:
      options?.jobId ??
      `${data.event}-${data.userId ?? "anon"}-${Date.now()}`,

    ...options,
  });
};