import fp from "fastify-plugin";
import { sendError } from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";

export default fp(async function (fastify, opts) {
    fastify.setErrorHandler(function (error, request, reply) {
        // Log error
        request.log.error(error);

        // 🔥 1.  Validation Errors (Fastify specific)
        if (error.validation) {
            return sendError(
                reply,
                HTTP_STATUS.BAD_REQUEST,
                "Validation Failed",
                error.validation.map(e => ({
                    field: e.instancePath.replace("/", "") || e.params.missingProperty,
                    message: e.message
                }))
            );
        }

        // 🔥 2.  JWT / Auth Errors
        if (error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER" || error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Authentication failed", error.message);
        }

        // 🔥 3.  Database Errors (Mongoose specific)
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => val.message);
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Database Validation Error", messages);
        }

        if (error.code === 11000) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Duplicate Entry Found", error.keyValue);
        }

        // 🔥 4.  Default Fallback
        const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const message = statusCode >= 500 ? "Internal Server Error" : error.message;

        return sendError(reply, statusCode, message, process.env.NODE_ENV === "development" ? error.stack : undefined);
    });
}, { name: "error-handler" });
