import { FastifyInstance } from "fastify";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";

/**
 * 🔥 Bull Board Dashboard (Integrated with Fastify)
 * Route: /admin/queues
 * Custom Dark Theme and Swagger-like experience.
 */

export const setupBullBoard = async (app: FastifyInstance) => {
  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: [
      new BullMQAdapter(app.queues.email),
      new BullMQAdapter(app.queues.notification),
      new BullMQAdapter(app.queues.analytics),
    ],
    serverAdapter: serverAdapter,
  });

  serverAdapter.setBasePath("/admin/queues");

  await app.register(serverAdapter.registerPlugin(), {
    prefix: "/admin/queues",
  });

  app.log.info("🔥 Bull Board dashboard integrated at /admin/queues");
};
