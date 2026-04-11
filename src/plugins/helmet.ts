import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import { FastifyInstance } from "fastify";

export default fp(async function (fastify: FastifyInstance) {
    fastify.register(helmet, {
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
                "style-src": ["'self'", "'unsafe-inline'", "https:", "fonts.googleapis.com"],
                "img-src": ["'self'", "data:", "https:", "validator.swagger.io"],
                "connect-src": ["'self'", "https:"],
                "font-src": ["'self'", "https:", "data:", "fonts.gstatic.com"],
            },
        },
    });
});
