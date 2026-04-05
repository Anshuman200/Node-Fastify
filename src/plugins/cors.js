import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import { ALLOWED_ORIGINS } from "../constants/config.js";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyCors, {
        origin: (origin, cb) => {
            // allow requests with no origin (mobile apps, Postman)
            if (!origin) return cb(null, true);

            if (ALLOWED_ORIGINS.includes(origin)) {
                cb(null, true);
            } else {
                cb(new Error("Not allowed by CORS"), false);
            }
        },
        methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    });
}, { name: "cors" });
