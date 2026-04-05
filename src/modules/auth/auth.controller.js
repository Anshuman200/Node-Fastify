import { UserModels } from "../users/user.model.js";
import { AdminModels } from "../admin/admin.model.js";
import { getUsersService } from "../users/user.service.js";
import { HTTP_STATUS } from "../../constants/httpStatusCodes.js";
import { MESSAGES } from "../../constants/messages.js";
import { sendSuccess, sendError } from "../../utils/responseHandler.js";
import { getCachedData, setCachedData, deleteCachedData, invalidateCache } from "../../core/cache/redisService.js";
import { JWT_EXPIRY } from "../../constants/config.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../core/email/emailService.js";
import { generateTokens, generateOtp } from "../users/user.helper.js";
import { toLowerCase, toTrim, toTrimAndLower, toTrimAndNumber, formatEntityResponse } from "../../utils/helper.js";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";
import * as authService from "../users/auth.service.js";

// 🔥 LOGIN USER
export const loginUser = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);
        const password = toTrim(reqData.password);

        if (!email || !password) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ALL_FIELDS_REQUIRED);
        }

        const user = await UserModels.findOne({ email: email });

        if (!user) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
        }

        if (user.status !== ACCOUNT_STATUS.ACTIVE) {
            return sendError(reply, HTTP_STATUS.FORBIDDEN, `Your account is ${user.status}. Please contact support.`);
        }

        if (!user.isEmailVerified) {
            return sendError(reply, HTTP_STATUS.FORBIDDEN, "Please verify your email before logging in");
        }

        const { accessToken, refreshToken } = generateTokens(req.server.jwt, user);

        // 🔥 Store refresh token in Redis
        await setCachedData(req.server.redis, `refreshToken:${user._id}`, refreshToken, JWT_EXPIRY.REFRESH_TOKEN_REDIS);

        // 🔥 Update session info
        user.lastLogin = new Date();
        user.isActive = true; // User is now online
        await user.save();

        const userResponse = formatEntityResponse(user);

        return sendSuccess(reply, HTTP_STATUS.OK, "Login successful", {
            accessToken,
            refreshToken,
            user: userResponse
        });

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 SIGNUP USER
export const signup = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);
        const userName = toTrimAndLower(reqData.userName);
        const name = toTrim(reqData.name);
        const password = toTrim(reqData.password);

        if (!name || !email || !userName || !password) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ALL_FIELDS_REQUIRED);
        }

        // Generate OTP
        const { otp, otpExpires } = generateOtp();

        const newUser = await UserModels.create({
            name: name,
            email: email,
            userName: userName,
            password: password,
            status: "pending",
            isEmailVerified: false,
            otp,
            otpExpires,
            userType: USER_TYPES.USER
        });

        // Send Email
        await sendVerificationEmail(newUser.email, otp);

        const userResponse = formatEntityResponse(newUser);
        return sendSuccess(reply, HTTP_STATUS.CREATED, "Registration successful. Please verify your email.", { user: userResponse });

    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : "User";
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, `${duplicateField} already exists`);
        }
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 VERIFY OTP
export const verifyOtp = async (req, reply) => {
    try {
        // const { email, otp } = req.body;
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);
        const otp = toTrimAndNumber(reqData.otp);

        if (!email || !otp) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email and OTP are required");
        }

        const result = await authService.verifyOtpService(UserModels, email, otp);
        if (result.success) {
            // invalidate cache
            await invalidateCache(req.server.redis);
            return sendSuccess(reply, HTTP_STATUS.OK, "Email verified successfully. You can now login.");
        }
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 RESEND OTP
export const resendOtp = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);

        if (!email) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email is required");

        const user = await UserModels.findOne({ email: email });
        if (!user) return sendError(reply, HTTP_STATUS.NOT_FOUND, "User not found");

        if (user.isEmailVerified) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email is already verified");
        }

        const { otp, otpExpires } = generateOtp();
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendVerificationEmail(user.email, otp);

        return sendSuccess(reply, HTTP_STATUS.OK, "New OTP sent to your email");
    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 REFRESH TOKEN
export const refreshToken = async (req, reply) => {
    try {
        const { refreshToken } = req.body || {};

        if (!refreshToken) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Refresh token is required");
        }

        const decoded = await req.server.jwt.verify(refreshToken);
        const userId = decoded.id;

        // 🔥 Check if token exists in Redis
        const storedToken = await getCachedData(req.server.redis, `refreshToken:${userId}`);

        if (!storedToken || storedToken !== refreshToken) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        const user = await UserModels.findById(userId);
        if (!user) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "User not found");
        }

        const tokens = generateTokens(req.server.jwt, user);

        // 🔥 Update refresh token in Redis
        await setCachedData(req.server.redis, `refreshToken:${user._id}`, tokens.refreshToken, JWT_EXPIRY.REFRESH_TOKEN_REDIS);

        return sendSuccess(reply, HTTP_STATUS.OK, "Token refreshed successfully", {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });

    } catch (error) {
        return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }
};

// 🔥 LOGOUT USER
export const logoutUser = async (req, reply) => {
    try {
        const { userName } = req.user; // Assumes request is authenticated

        // 🔥 Update online status
        const user = await UserModels.findOne({ userName });
        if (user) {
            user.isActive = false; // User is now offline
            await user.save();
        }

        // 🔥 Remove refresh token from Redis
        await deleteCachedData(req.server.redis, `refreshToken:${userName}`);

        return sendSuccess(reply, HTTP_STATUS.OK, "Logged out successfully");
    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 FORGOT PASSWORD
export const forgotPassword = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);

        if (!email) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email is required");

        const result = await authService.forgotPasswordService(UserModels, email);
        return sendSuccess(reply, HTTP_STATUS.OK, result.message);
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 RESET PASSWORD
export const resetPassword = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const email = toTrimAndLower(reqData.email);
        const otp = toTrim(reqData.otp);
        const newPassword = toTrim(reqData.newPassword);

        if (!email || !otp || !newPassword) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "All fields are required");

        const result = await authService.resetPasswordService(UserModels, email, otp, newPassword);
        return sendSuccess(reply, HTTP_STATUS.OK, result.message);
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 CHANGE PASSWORD (Authenticated)
export const changePassword = async (req, reply) => {
    try {
        const reqData = req.body || {};
        const oldPassword = toTrim(reqData.oldPassword);
        const newPassword = toTrim(reqData.newPassword);
        const { userName } = req.user;

        const user = await UserModels.findOne({ userName });
        const result = await authService.changePasswordService(user, oldPassword, newPassword);
        return sendSuccess(reply, HTTP_STATUS.OK, result.message);
    } catch (error) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

// 🔥 GET ME (User Detail API)
export const getMeUser = async (req, reply) => {
    try {
        const { userName } = req.user;
        const user = await UserModels.findOne({ userName }).lean();

        if (!user) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "User profile not found");
        }

        const response = formatEntityResponse(user);
        return sendSuccess(reply, HTTP_STATUS.OK, "User profile fetched successfully", { profile: response });

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

// 🔥 GET ME (Admin Detail API)
export const getMeAdmin = async (req, reply) => {
    try {
        const { userName } = req.user;
        const admin = await AdminModels.findOne({ userName }).lean();

        if (!admin) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "Admin profile not found");
        }

        const response = formatEntityResponse(admin);
        return sendSuccess(reply, HTTP_STATUS.OK, "Admin profile fetched successfully", { profile: response });

    } catch (error) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};