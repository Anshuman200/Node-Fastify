import { FastifyRequest, FastifyReply } from "fastify";
import { HTTP_STATUS } from "../../constants/httpStatusCodes.js";
import { MESSAGES } from "../../constants/messages.js";
import { toTrim, toTrimAndLower, toTrimAndNumber, formatEntityResponse } from "../../utils/helper.js";
import { ACCOUNT_STATUS } from "../../constants/status.js";
import * as authService from "../users/auth.service.js";
import { AdminModels } from "./admin.model.js";
import { sendSuccess, sendError } from "../../utils/responseHandler.js";
import { generateAdminTokens } from "./admin.helper.js";
import { buildCacheKey } from "../users/user.helper.js";
import { getCachedData, setCachedData, invalidateCache } from "../../core/cache/redisService.js";
import { UserModels } from "../users/user.model.js";
import { getUsersService } from "../users/user.service.js";
import { JWT_EXPIRY } from "../../constants/config.js";

// --- Validations & Types ---

interface LoginBody {
    email?: string;
    password?: string;
}

interface GetAllUsersQuery {
    page?: number;
    limit?: number;
    status?: string;
    isActive?: string;
    userType?: string;
    search?: string;
}

interface UserParams {
    userName: string;
}

interface UpdateUserBody {
    name?: string;
    email?: string;
    userName?: string;
    userType?: string;
    status?: string;
}

interface DeleteMultipleBody {
    userNames: string[];
}

interface OtpBody {
    email: string;
    otp: string;
}

interface ResetPasswordBody extends OtpBody {
    newPassword: string;
}

interface ChangePasswordBody {
    oldPassword?: string;
    newPassword?: string;
}

// --- Controller Actions ---

export const loginAdmin = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const body = req.body as LoginBody;
        const email = toTrimAndLower(body?.email);
        const password = toTrim(body?.password);

        if (!email || !password) {
            return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.ADMIN.INVALID_CREDENTIALS });
        }

        const admin = await AdminModels.findOne({ email });
        if (!admin) {
            return sendError({ reply, statusCode: HTTP_STATUS.NOT_FOUND, message: MESSAGES.ADMIN.ADMIN_NOT_FOUND });
        }

        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return sendError({ reply, statusCode: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.ADMIN.INVALID_CREDENTIALS });
        }

        if (admin.status !== ACCOUNT_STATUS.ACTIVE) {
            return sendError({ reply, statusCode: HTTP_STATUS.FORBIDDEN, message: `Your admin account is ${admin.status}. Please contact the system owner.` });
        }

        const { accessToken, refreshToken } = generateAdminTokens(req.server.jwt, admin);

        admin.lastLogin = new Date();
        admin.isActive = true;
        await admin.save();

        const cacheKey = `refreshToken:${admin.userName}`;
        await req.server.redis.set(cacheKey, refreshToken, "EX", JWT_EXPIRY.REFRESH_TOKEN_REDIS);

        const adminResponse = formatEntityResponse(admin);

        return sendSuccess({
            reply,
            statusCode: HTTP_STATUS.OK,
            message: MESSAGES.ADMIN.ADMIN_LOGIN_SUCCESS,
            data: {
                admin: adminResponse,
                accessToken,
                refreshToken
            }
        });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const getAllUsers = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { page = 1, limit = 10, status, isActive, userType, search } = req.query as GetAllUsersQuery;

        const safeLimit = Math.min(Number(limit), 50);
        const skip = (Number(page) - 1) * safeLimit;

        const query: any = {};

        if (status) query.status = status;
        if (isActive !== undefined) query.isActive = isActive === "true";
        if (userType) query.userType = userType;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { userName: { $regex: search, $options: "i" } }
            ];
        }

        const cacheKey = buildCacheKey(req.query);

        const cached = await getCachedData(req.server.redis, cacheKey);
        if (cached) {
            return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: MESSAGES.USER_FETCHED_SUCCESS, data: cached });
        }

        const { users, total } = await getUsersService({
            query,
            skip,
            limit: safeLimit
        });

        const data = {
            total,
            page: Number(page),
            limit: safeLimit,
            users
        };

        await setCachedData(req.server.redis, cacheKey, data, 60);

        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: MESSAGES.USER_FETCHED_SUCCESS, data });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const getSingleUser = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { userName } = req.params as UserParams;
        const normalizedUserName = toTrimAndLower(userName);

        const user = await UserModels.findOne({ userName: normalizedUserName }).lean();

        if (!user) {
            return sendError({ reply, statusCode: HTTP_STATUS.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND });
        }

        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: MESSAGES.USER_FETCHED_SUCCESS, data: { user } });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const updateSingleUser = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const body = req.body as UpdateUserBody;
        const { userName } = req.params as UserParams;
        const normalizedUserName = toTrimAndLower(userName);

        const updates: any = {};

        if (body.name) updates.name = toTrim(body.name);
        if (body.email) updates.email = toTrimAndLower(body.email);
        if (body.userName) updates.userName = toTrimAndLower(body.userName);
        if (body.userType) updates.userType = toTrim(body.userType);
        if (body.status) updates.status = toTrim(body.status);

        const user = await UserModels.findOneAndUpdate(
            { userName },
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        if (!user) {
            return sendError({ reply, statusCode: HTTP_STATUS.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND });
        }

        await invalidateCache(req.server.redis);

        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: MESSAGES.USER_UPDATED_SUCCESS, data: { user } });
    } catch (error: any) {
        if (error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : "User";
            const formattedField = duplicateField === "userName" ? "Username" : duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1);
            return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: `${formattedField} already exists` });
        }
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const deleteSingleUser = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { userName } = req.params as UserParams;
        const normalizedUserName = toTrimAndLower(userName);

        const user = await UserModels.findOneAndUpdate(
            { userName: normalizedUserName },
            { isActive: false, status: ACCOUNT_STATUS.DELETE },
            { new: true }
        ).lean();

        if (!user) {
            return sendError({ reply, statusCode: HTTP_STATUS.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND });
        }

        await invalidateCache(req.server.redis);

        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: MESSAGES.USER_DEACTIVATED_SUCCESS });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const deleteMultipleUsers = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { userNames } = req.body as DeleteMultipleBody;

        if (!userNames || !Array.isArray(userNames)) {
            return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.VALIDATION_INVALID_INPUT });
        }

        const normalized = userNames.map(u => toTrimAndLower(u));

        const result = await UserModels.updateMany(
            { userName: { $in: normalized } },
            { isActive: false, status: ACCOUNT_STATUS.DELETE }
        );

        await invalidateCache(req.server.redis);

        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: MESSAGES.USERS_DELETED_SUCCESS, data: { count: result.modifiedCount } });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const verifyOtp = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const body = req.body as OtpBody;
        const email = toTrimAndLower(body.email);
        const otp = toTrimAndNumber(body.otp).toString();

        if (!email || !otp) return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: "Email and OTP are required" });

        await authService.verifyOtpService(AdminModels, email, otp);
        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: "Admin email verified successfully." });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: error.message });
    }
};

export const forgotPassword = async (req: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
    try {
        const email = toTrimAndLower(req.body.email);

        if (!email) return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: "Email is required" });

        const result = await authService.forgotPasswordService(AdminModels, email);
        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: result.message });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: error.message });
    }
};

export const resetPassword = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { email, otp, newPassword } = req.body as ResetPasswordBody;
        const normalizedEmail = toTrimAndLower(email);
        const normalizedOtp = toTrim(otp);
        const normalizedPassword = toTrim(newPassword);

        if (!normalizedEmail || !normalizedOtp || !normalizedPassword) {
            return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: "All fields are required" });
        }

        const result = await authService.resetPasswordService(AdminModels, normalizedEmail, normalizedOtp, normalizedPassword);
        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: result.message });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: error.message });
    }
};

export const changePassword = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { userName } = req.user;
        const { oldPassword, newPassword } = req.body as ChangePasswordBody;

        if (!oldPassword || !newPassword) {
            return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: "Old and new passwords are required" });
        }

        const admin = await AdminModels.findOne({ userName });
        if (!admin) return sendError({ reply, statusCode: HTTP_STATUS.NOT_FOUND, message: MESSAGES.ADMIN.ADMIN_NOT_FOUND });

        const result = await authService.changePasswordService(admin, toTrim(oldPassword), toTrim(newPassword));
        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: result.message });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.BAD_REQUEST, message: error.message });
    }
};

export const logoutAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userName } = req.user;

        const admin = await AdminModels.findOne({ userName });
        if (admin) {
            admin.isActive = false;
            await admin.save();
        }

        const cacheKey = `refreshToken:${userName}`;
        await req.server.redis.del(cacheKey);

        return sendSuccess({ reply, statusCode: HTTP_STATUS.OK, message: "Admin logged out successfully" });
    } catch (error: any) {
        return sendError({ reply, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: error.message });
    }
};