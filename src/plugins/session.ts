import fp from "fastify-plugin";
import fastifyCookie from "@fastify/cookie";
import fastifySecureSession from "@fastify/secure-session";
import crypto from "crypto";
import { FastifyInstance } from "fastify";

export default fp(async function (fastify: FastifyInstance) {
    const cookieSecret = process.env.COOKIE_SECRET || "a_very_secret_key_that_should_be_at_least_32_chars";
    
    // ✅ Derive a stable 32-byte key from the secret for AES-256-GCM
    const key = crypto.createHash("sha256").update(cookieSecret).digest();

    // 🍪 Register Cookie Plugin
    await fastify.register(fastifyCookie, {
        secret: cookieSecret
    });

    // 🔐 Register Secure Session Plugin (Encrypted Cookies)
    await fastify.register(fastifySecureSession, {
        key: key,
        cookieName: "session",
        cookie: {
            path: "/",
            httpOnly: true, // Prevents JS access (XSS protection)
            secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
            sameSite: "lax", // Standard CSRF protection
        }
    });
});
