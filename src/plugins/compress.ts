import fp from "fastify-plugin";
import compress from "@fastify/compress";
import { FastifyInstance } from "fastify";

export default fp(async function (fastify: FastifyInstance) {
    fastify.register(compress, {
        global: true,
        threshold: 1024, // 1KB
    });
});
