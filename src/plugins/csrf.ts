import fp from "fastify-plugin";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrf from "@fastify/csrf-protection";
import { FastifyInstance } from "fastify";

export default fp(async function (fastify: FastifyInstance) {
    // 1.  Cookie Plugin is already registered in session.ts

    // 2. Register CSRF Protection
    await fastify.register(fastifyCsrf, {
        sessionKey: "csrf-token", // Store secret in encrypted session
        getToken: (req: any) => req.headers["x-csrf-token"],
    });

    // 3. Global Hook to generate and send CSRF token on specific requests
    fastify.addHook("onSend", async (request, reply, payload) => {
        // Only set the token on successful primary requests or explicitly on login/signup
        if (reply.statusCode === 200 || reply.statusCode === 201) {
            const token = (reply as any).generateCsrf();
            // We set it in a header so the frontend can store it and send it back
            reply.header("x-csrf-token", token);
        }
        return payload;
    });

}, { name: "csrf" });
