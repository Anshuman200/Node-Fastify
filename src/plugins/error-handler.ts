import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sendError } from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";

export default fp(async function (fastify: FastifyInstance) {
    fastify.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
        const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const message = error.message || "Internal Server Error";

        if (statusCode >= 500) {
            fastify.log.error(error);
        }

        return sendError(reply, statusCode, message, (process.env as any).NODE_ENV === "development" ? error.stack : undefined);
    });
});
