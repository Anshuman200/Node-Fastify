import { HTTP_STATUS } from "../../constants/httpStatusCodes.js";
import { MESSAGES } from "../../constants/messages.js";
import { toLowerCase, toTrim, toTrimAndLower, toTrimAndNumber, formatEntityResponse } from "../../utils/helper.js";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";
import * as authService from "../users/auth.service.js";
import { AdminModels } from "./admin.model.js";
import { sendSuccess, sendError } from "../../utils/responseHandler.js";
import { generateAdminTokens } from "./admin.helper.js";
import { buildCacheKey } from "../users/user.helper.js";
import { getCachedData, setCachedData, invalidateCache } from "../../core/cache/redisService.js";
import { UserModels } from "../users/user.model.js";
import { getUsersService } from "../users/user.service.js";
import { JWT_EXPIRY } from "../../constants/config.js";

export const loginAdmin = async (req, reply) => {
    try {
        const reqData = req.body
        const email = toTrimAndLower(reqData?.email)
        const password = toTrim(reqData?.password)

        if (!email || !password) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, MESSAGES.ADMIN.INVALID_CREDENTIALS);
        }

        const admin = await AdminModels.findOne({ email: email });
        if (!admin) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, MESSAGES.ADMIN.ADMIN_NOT_FOUND);
        }

        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, MESSAGES.ADMIN.INVALID_CREDENTIALS);
        }

        if (admin.status !== ACCOUNT_STATUS.ACTIVE) {
            return sendError(reply, HTTP_STATUS.FORBIDDEN, `Your admin account is ${admin.status}. Please contact the system owner.`);
        }

        const { accessToken, refreshToken } = generateAdminTokens(req.server.jwt, admin);

        // 🔥 Update admin session info
        admin.lastLogin = new Date();
        admin.isActive = true; // Admin is now online
        await admin.save();

        // 🔥 Store refresh token in Redis using userName
        const cacheKey = `refreshToken:${admin.userName}`;
        await req.server.redis.set(cacheKey, refreshToken, "EX", JWT_EXPIRY.REFRESH_TOKEN_REDIS);

        const adminResponse = formatEntityResponse(admin);

        return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.ADMIN.ADMIN_LOGIN_SUCCESS, {
            admin: adminResponse,
            accessToken,
            refreshToken
        });
    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
}


// 🔥 GET ALL USERS
export const getAllUsers = async (req, reply) => {
    try {
        const { page = 1, limit = 10, status, isActive, userType, search } = req.query;

        const safeLimit = Math.min(Number(limit), 50);
        const skip = (page - 1) * safeLimit;

        const query = {};

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

        // 🔥 GET CACHE using Redis Service
        const cached = await getCachedData(req.server.redis, cacheKey);
        if (cached) {
            return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.USER_FETCHED_SUCCESS, cached);
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

        // 🔥 SET CACHE using Redis Service (TTL 60 sec)
        await setCachedData(req.server.redis, cacheKey, data, 60);

        return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.USER_FETCHED_SUCCESS, data);

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 GET SINGLE USER
export const getSingleUser = async (req, reply) => {
    try {
        const reqData = req.params || {};
        const userName = toTrimAndLower(reqData.userName);

        const user = await UserModels.findOne({
            userName: userName
        }).lean();

        if (!user) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
        }

        return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.USER_FETCHED_SUCCESS, { user });

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 UPDATE USER
export const updateSingleUser = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const paramsData = req.params || {};
        const userName = toTrimAndLower(paramsData.userName);

        const updates = {};

        if (reqData.name) updates.name = toTrim(reqData.name);
        if (reqData.email) updates.email = toTrimAndLower(reqData.email);
        if (reqData.userName) updates.userName = toTrimAndLower(reqData.userName);
        if (reqData.userType) updates.userType = toTrim(reqData.userType);
        if (reqData.status) updates.status = toTrim(reqData.status);

        const user = await UserModels.findOneAndUpdate(
            { userName: userName },
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        if (!user) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
        }

        // 🔥 invalidate cache using Redis Service
        await invalidateCache(req.server.redis);

        return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.USER_UPDATED_SUCCESS, { user });

    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : "User";
            const formattedField = duplicateField === "userName" ? "Username" : duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1);
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, `${formattedField} already exists`);
        }
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 DELETE SINGLE USER
export const deleteSingleUser = async (req, reply) => {
    try {
        const paramsData = req.params || {};
        const userName = toTrimAndLower(paramsData.userName);

        const user = await UserModels.findOneAndUpdate(
            { userName: userName },
            { isActive: false, status: ACCOUNT_STATUS.DELETE },
            { new: true }
        ).lean();

        if (!user) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
        }

        // 🔥 invalidate cache using Redis Service
        await invalidateCache(req.server.redis);

        return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.USER_DEACTIVATED_SUCCESS);

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 DELETE MULTIPLE USERS
export const deleteMultipleUsers = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const userNames = reqData.userNames;

        if (!userNames || !Array.isArray(userNames)) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_INVALID_INPUT);
        }

        const normalized = userNames.map(u => toLowerCase(u));

        const result = await UserModels.updateMany(
            { userName: { $in: normalized } },
            { isActive: false, status: ACCOUNT_STATUS.DELETE }
        );

        // 🔥 invalidate cache using Redis Service
        await invalidateCache(req.server.redis);

        return sendSuccess(reply, HTTP_STATUS.OK, MESSAGES.USERS_DELETED_SUCCESS, { count: result.modifiedCount });

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 VERIFY OTP (Admin)
export const verifyOtp = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);
        const otp = toTrimAndNumber(reqData.otp);

        if (!email || !otp) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email and OTP are required");

        const result = await authService.verifyOtpService(AdminModels, email, otp);
        return sendSuccess(reply, HTTP_STATUS.OK, "Admin email verified successfully.");
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 FORGOT PASSWORD (Admin)
export const forgotPassword = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);

        if (!email) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email is required");

        const result = await authService.forgotPasswordService(AdminModels, email);
        return sendSuccess(reply, HTTP_STATUS.OK, result.message);
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 RESET PASSWORD (Admin)
export const resetPassword = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);
        const otp = toTrim(reqData.otp);
        const newPassword = toTrim(reqData.newPassword);

        if (!email || !otp || !newPassword) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "All fields are required");

        const result = await authService.resetPasswordService(AdminModels, email, otp, newPassword);
        return sendSuccess(reply, HTTP_STATUS.OK, result.message);
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 CHANGE PASSWORD (Admin Authenticated)
export const changePassword = async (req, reply) => {
    try {
        const { userName } = req.user;

        const admin = await AdminModels.findOne({ userName });
        const result = await authService.changePasswordService(admin, oldPassword, newPassword);
        return sendSuccess(reply, HTTP_STATUS.OK, result.message);
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 LOGOUT ADMIN
export const logoutAdmin = async (req, reply) => {
    try {
        const { userName } = req.user; // Assumes request is authenticated

        // 🔥 Update online status
        const admin = await AdminModels.findOne({ userName });
        if (admin) {
            admin.isActive = false; // Admin is now offline
            await admin.save();
        }

        // 🔥 Remove refresh token from Redis
        const cacheKey = `refreshToken:${userName}`;
        await req.server.redis.del(cacheKey);

        return sendSuccess(reply, HTTP_STATUS.OK, "Admin logged out successfully");
    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};