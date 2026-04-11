import { FastifyReply } from "fastify";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";

/**
 * Standardize successful API responses
 * @param {FastifyReply} reply - Fastify reply object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Payload data (optional)
 */
export const sendSuccess = ({ reply, statusCode = HTTP_STATUS.OK, message, data = {} }: { reply: FastifyReply, statusCode?: number, message: string, data?: any }) => {
    return reply.status(statusCode).send({
        success: true,
        message,
        ...data,
    });
};

/**
 * Standardize error API responses
 * @param {FastifyReply} reply - Fastify reply object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} error - Error details (optional)
 */
export const sendError = ({ reply, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message, error = null }: { reply: FastifyReply, statusCode?: number, message: string, error?: any }) => {
    const errorResponse: { success: boolean; message: string; error?: any } = {
        success: false,
        message,
    };

    if (error) {
        errorResponse.error = error;
    }

    return reply.status(statusCode).send(errorResponse);
};
