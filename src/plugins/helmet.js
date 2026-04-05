import fp from "fastify-plugin";
import fastifyHelmet from "@fastify/helmet";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyHelmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https: http:"],
                styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https: http:"],
                connectSrc: ["'self'", "https: http:"],
            },
        },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: "sameorigin" },
        hsts: {
            maxAge: 31536000, 
            includeSubDomains: true,
            preload: true
        },
        crossOriginEmbedderPolicy: false, // Set to false if you have external images
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-origin" },
        global: true
    });
}, { name: "helmet" });
