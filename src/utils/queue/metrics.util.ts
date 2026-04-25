import { Queue } from "bullmq";

/**
 * 📊 Queue Metrics Utility
 */

export interface QueueHealthStatus {
  name: string;
  isReady: boolean;
  waiting: number;
  active: number;
  failed: number;
  completed: number;
}

export const getQueueMetrics = async (queue: Queue): Promise<QueueHealthStatus> => {
  const [waiting, active, failed, completed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getFailedCount(),
    queue.getCompletedCount(),
  ]);

  // A queue is "ready" if it can perform a simple count operation
  const isReady = await queue.client.then(c => c.ping()).then(res => res === "PONG").catch(() => false);

  return {
    name: queue.name,
    isReady,
    waiting,
    active,
    failed,
    completed,
  };
};

/**
 * 🛡️ Backpressure Check
 * Returns true if the queue is overloaded (e.g., > 10k waiting jobs)
 */
export const isQueueOverloaded = async (queue: Queue, limit = 10000): Promise<boolean> => {
  const count = await queue.getWaitingCount();
  return count > limit;
};
