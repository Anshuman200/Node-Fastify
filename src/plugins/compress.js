import fp from "fastify-plugin";
import fastifyCompress from "@fastify/compress";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyCompress, {
        global: true,
        threshold: 1024, // Only compress responses > 1KB
        zlibOptions: { level: 9 }, // Max compression
        brotliOptions: { params: { [0]: 11 } } // Max Brotli
    });
}, { name: "compress" });
