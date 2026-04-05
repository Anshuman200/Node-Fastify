// utils/responseHandler.js
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";

/**
 * Standardize successful API responses
 * @param {Object} reply - Fastify reply object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Payload data (optional)
 */
export const sendSuccess = (reply, statusCode = HTTP_STATUS.OK, message, data = {}) => {
    return reply.status(statusCode).send({
        success: true,
        message,
        ...data,
    });
};

/**
 * Standardize error API responses
 * @param {Object} reply - Fastify reply object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} error - Error details (optional)
 */
export const sendError = (reply, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message, error = null) => {
    const errorResponse = {
        success: false,
        message,
    };

    if (error) {
        errorResponse.error = error;
    }

    return reply.status(statusCode).send(errorResponse);
};
