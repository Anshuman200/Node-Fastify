import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { createEmailQueue } from "../queue/queues/email.queue.js";
import { createNotificationQueue } from "../queue/queues/notification.queue.js";
import { createAnalyticsQueue } from "../queue/queues/analytics.queue.js";
import { setupBullBoard } from "../queue/dashboard/bullBoard.js";

/**
 * 🔌 Production-Hardened Queue Plugin
 * Responsible for initializing queues and the monitoring dashboard.
 * Business logic and health routes are handled by their respective modules.
 */
export default fp(async function queuePlugin(app: FastifyInstance) {
  // 1. Initialize Queues (Single connection reuse)
  const queues = {
    email: createEmailQueue(app.redis),
    notification: createNotificationQueue(app.redis),
    analytics: createAnalyticsQueue(app.redis),
  };

  app.decorate("queues", queues);

  // 2. Setup Dashboard (Protected via admin auth)
  await app.register(async (adminScope) => {
    adminScope.addHook("onRequest", app.authenticateAdmin);
    await setupBullBoard(adminScope);
  });

  // 3. Graceful Shutdown
  app.addHook("onClose", async (instance) => {
    instance.log.info("📡 Closing BullMQ queues...");
    await Promise.all(Object.values(instance.queues).map(q => q.close()));
  });

  app.log.info("✅ BullMQ Infrastructure initialized");
}, {
  name: "queue-plugin",
  dependencies: ["redis", "jwt", "security"]
});
