import fp from "fastify-plugin";
import basicAuth from "@fastify/basic-auth";
import { FastifyInstance } from "fastify";
import { DOCS_AUTH } from "../constants/config.js";

export default fp(async function basicAuthPlugin(app: FastifyInstance) {
    await app.register(basicAuth, {
        validate: async (username, password, _request, _reply) => {
            if (username !== DOCS_AUTH.username || password !== DOCS_AUTH.password) {
                return new Error("Unauthorized");
            }
        },
        authenticate: { realm: "Docs" }
    });

    app.addHook("onRequest", (request, reply, done) => {
        const url = request.url.split('?')[0];
        // Protect welcome page and swagger docs
        if (url === "/" || url.startsWith("/swagger")) {
            (app as any).basicAuth(request, reply, done);
        } else {
            done();
        }
    });
}, { name: "basic-auth-plugin" });
