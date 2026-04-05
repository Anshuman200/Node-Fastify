import fp from "fastify-plugin";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrf from "@fastify/csrf-protection";

export default fp(async function (fastify, opts) {
    // 1.  Register Cookie Plugin (Required for CSRF)
    await fastify.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || "supersecret_cookie_key"
    });

    // 2. Register CSRF Protection
    await fastify.register(fastifyCsrf, {
        cookieKey: "csrf-token",
        cookieOpts: {
            signed: true,
            httpOnly: true, // Frontend cannot read, only backend
            sameSite: "strict",
            path: "/",
            secure: process.env.NODE_ENV === "production"
        },
        getToken: (req) => req.headers["x-csrf-token"],
    });

    // 3. Global Hook to generate and send CSRF token on specific requests
    fastify.addHook("onSend", async (request, reply, payload) => {
        // Only set the token on successful primary requests or explicitly on login/signup
        if (reply.statusCode === 200 || reply.statusCode === 201) {
            const token = reply.generateCsrf();
            // We set it in a header so the frontend can store it and send it back
            reply.header("x-csrf-token", token);
        }
        return payload;
    });

}, { name: "csrf" });
