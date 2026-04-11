import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import { ALLOWED_ORIGINS } from "../constants/config.js";

export default fp(async function (fastify: FastifyInstance) {
    fastify.register(cors, {
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);

            if (ALLOWED_ORIGINS.includes(origin)) {
                return cb(null, true);
            }

            cb(new Error("Not allowed by CORS"), false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
});
