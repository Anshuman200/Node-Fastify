import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import { FastifyInstance, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";
import { sendError } from "../utils/responseHandler.js";
import { MAX_REQUEST_PER_MINUTE } from "../constants/config.js";

export default fp(async function (fastify: FastifyInstance) {
    fastify.register(rateLimit, {
        max: MAX_REQUEST_PER_MINUTE,
        timeWindow: "1 minute",
        errorResponseBuilder: (request: FastifyRequest, context: any) => {
            return {
                statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
                error: "Too Many Requests",
                message: `Slow down! You are limited to ${context.max} requests per ${context.after}.`,
                date: new Date(),
                expiresIn: context.after
            };
        }
    });

}, { name: "app-rate-limit" });
