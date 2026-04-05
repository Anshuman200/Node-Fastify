import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { sendError } from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";
import { USER_TYPES } from "../constants/status.js";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || "supersecret_default_key"
    });

    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Please provide a valid token", err.message);
        }
    });

    fastify.decorate("authenticateAdmin", async function (request, reply) {
        try {
            await request.jwtVerify();
            if (request.user.userType !== USER_TYPES.ADMIN && request.user.userType !== USER_TYPES.SUB_ADMIN) {
                return sendError(reply, HTTP_STATUS.FORBIDDEN, "Access Denied: Admin privileges required");
            }
        } catch (err) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Please provide a valid admin token", err.message);
        }
    });

    fastify.decorate("authenticateUser", async function (request, reply) {
        try {
            await request.jwtVerify();
            if (request.user.userType !== USER_TYPES.USER && request.user.userType !== USER_TYPES.GUEST) {
                return sendError(reply, HTTP_STATUS.FORBIDDEN, "Access Denied: Standard user privileges required");
            }
        } catch (err) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Unauthorized: Please provide a valid user token", err.message);
        }
    });
});
