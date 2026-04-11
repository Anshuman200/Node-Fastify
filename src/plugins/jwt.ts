import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sendError } from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";
import { USER_TYPES } from "../constants/status.js";

export default fp(async function (fastify: FastifyInstance) {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || "supersecret_default_key"
    });

    fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err: any) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Please provide a valid token", err.message);
        }
    });

    fastify.decorate("authenticateAdmin", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
            if (request.user.userType !== USER_TYPES.ADMIN && request.user.userType !== (USER_TYPES as any).SUB_ADMIN) {
                return sendError(reply, HTTP_STATUS.FORBIDDEN, "Access Denied: Admin privileges required");
            }
        } catch (err: any) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Please provide a valid admin token", err.message);
        }
    });

    fastify.decorate("authenticateUser", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
            if (request.user.userType !== USER_TYPES.USER && request.user.userType !== USER_TYPES.GUEST) {
                return sendError(reply, HTTP_STATUS.FORBIDDEN, "Access Denied: Standard user privileges required");
            }
        } catch (err: any) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Please provide a valid user token", err.message);
        }
    });
});
