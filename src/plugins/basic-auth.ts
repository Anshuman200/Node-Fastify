import fp from "fastify-plugin";
import basicAuth from "@fastify/basic-auth";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
import { DOCS_AUTH } from "../constants/config.js";

/**
 * 🔐 Docs Basic Auth (Production Ready)
 * - Timing-safe comparison
 * - Proper Fastify typing (no `any`)
 * - Async-safe wrapper for callback middleware
 * - Scoped to docs routes only
 */

export default fp(async function basicAuthPlugin(app: FastifyInstance) {
    /**
     * 🔐 Timing-safe comparison
     */
    const safeCompare = (a: string, b: string) =>
        a.length === b.length &&
        crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

    /**
     * 🔐 Register plugin
     */
    await app.register(basicAuth, {
        validate: async (username, password) => {
            const userOk = safeCompare(username, DOCS_AUTH.username);
            const passOk = safeCompare(password, DOCS_AUTH.password);

            if (!userOk || !passOk) {
                // Must throw (not return)
                throw new Error("Unauthorized");
            }
        },
        authenticate: { realm: "Docs" },
    });

    /**
     * 🔒 Protect docs routes only
     */
    app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
        const url = normalizePath(request.url);

        const isDocsRoute =
            url.startsWith("/swagger") ||
            url.startsWith("/documentation");

        if (!isDocsRoute) return;

        // 🔥 Wrap callback-style basicAuth into Promise
        await new Promise<void>((resolve, reject) => {
            app.basicAuth(request, reply, (err?: Error) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}, { name: "basic-auth-plugin" });

/**
 * 🔧 Normalize URL (avoid query + trailing slash issues)
 */
function normalizePath(url: string): string {
    return url.split("?")[0].replace(/\/+$/, "") || "/";
}