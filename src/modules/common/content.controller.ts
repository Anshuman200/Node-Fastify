import { FastifyRequest, FastifyReply } from "fastify";
import { Content as ContentModels } from "../../db/models/content.model.js";
import { sendSuccess, sendError } from "../../utils/responseHandler.js";
import { HTTP_STATUS } from "../../constants/httpStatusCodes.js";

/**
 * ℹ️ Fetch all common system content (Terms, Privacy, FAQ, About)
 */
export const getSystemContent = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const contents = await ContentModels.find({}).select("key title content updatedAt").lean();

        return sendSuccess({
            reply,
            statusCode: HTTP_STATUS.OK,
            message: "Common content fetched successfully",
            data: contents
        });
    } catch (error: any) {
        return sendError({
            reply,
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

/**
 * ℹ️ Fetch specific content by key
 */
export const getContentByKey = async (req: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
    try {
        const { key } = req.params;
        const content = await ContentModels.findOne({ key: key.toLowerCase() }).lean();

        if (!content) {
            return sendError({
                reply,
                statusCode: HTTP_STATUS.NOT_FOUND,
                message: "Content not found"
            });
        }

        return sendSuccess({
            reply,
            statusCode: HTTP_STATUS.OK,
            message: "Content fetched successfully",
            data: { content }
        });
    } catch (error: any) {
        return sendError({
            reply,
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};
