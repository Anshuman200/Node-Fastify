import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sendError } from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";
import { USER_TYPES } from "../constants/status.js";
import { env } from "../config/env.js";

export default fp(async function (fastify: FastifyInstance) {
    fastify.register(fastifyJwt, {
        secret: env.JWT_SECRET
    });

    fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        if (request.headers.authorization?.startsWith("Bearer ")) {
            try {
                await request.jwtVerify();
                return;
            } catch (err: any) {
                return sendError({ reply, statusCode: HTTP_STATUS.UNAUTHORIZED, message: "Invalid or expired token", error: err.message });
            }
        }

        const sessionUser = request.session?.get("user");
        if (sessionUser) {
            request.user = sessionUser;
            return;
        }

        return sendError({ reply, statusCode: HTTP_STATUS.UNAUTHORIZED, message: "Unauthorized: Please provide a valid session or token" });
    });

    fastify.decorate("authenticateAdmin", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            if (request.headers.authorization?.startsWith("Bearer ")) {
                await request.jwtVerify();
            } else {
                const user = request.session?.get("user");
                if (!user) throw new Error("Unauthorized");
                request.user = user;
            }

            const user = request.user as any;
            if (user.userType !== USER_TYPES.ADMIN && user.userType !== (USER_TYPES as any).SUB_ADMIN) {
                return sendError({ reply, statusCode: HTTP_STATUS.FORBIDDEN, message: "Access Denied: Admin privileges required" });
            }
        } catch (err: any) {
            return sendError({ reply, statusCode: HTTP_STATUS.UNAUTHORIZED, message: "Unauthorized: Please provide a valid admin session or token", error: err.message });
        }
    });

    fastify.decorate("authenticateUser", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            if (request.headers.authorization?.startsWith("Bearer ")) {
                await request.jwtVerify();
            } else {
                const user = request.session?.get("user");
                if (!user) throw new Error("Unauthorized");
                request.user = user;
            }

            const user = request.user as any;
            if (!user) {
                return sendError({ reply, statusCode: HTTP_STATUS.UNAUTHORIZED, message: "Unauthorized: Missing user context" });
            }

            if (user.userType !== USER_TYPES.USER && user.userType !== USER_TYPES.GUEST) {
                return sendError({ reply, statusCode: HTTP_STATUS.FORBIDDEN, message: "Access Denied: Standard user privileges required" });
            }
        } catch (err: any) {
            return sendError({ reply, statusCode: HTTP_STATUS.UNAUTHORIZED, message: "Unauthorized: Please provide a valid user session or token", error: err.message });
        }
    });
});
