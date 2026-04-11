import { FastifyRequest, FastifyReply } from "fastify";
import { UserModels } from "../users/user.model.js";
import { AdminModels } from "../admin/admin.model.js";
import { HTTP_STATUS } from "../../constants/httpStatusCodes.js";
import { MESSAGES } from "../../constants/messages.js";
import { sendSuccess, sendError } from "../../utils/responseHandler.js";
import { getCachedData, setCachedData, deleteCachedData, invalidateCache } from "../../core/cache/redisService.js";
import { JWT_EXPIRY } from "../../constants/config.js";
import { sendVerificationEmail } from "../../core/email/emailService.js";
import { generateTokens, generateOtp } from "../users/user.helper.js";
import { toTrim, toTrimAndLower, toTrimAndNumber, formatEntityResponse } from "../../utils/helper.js";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";
import * as authService from "../users/auth.service.js";

// --- Types & Interfaces ---

interface LoginBody {
    email?: string;
    password?: string;
}

interface SignupBody {
    name?: string;
    email?: string;
    userName?: string;
    password?: string;
}

interface VerifyOtpBody {
    email?: string;
    otp?: string;
}

interface ResendOtpBody {
    email?: string;
}

interface RefreshTokenBody {
    refreshToken?: string;
}

interface ForgotPasswordBody {
    email?: string;
}

interface ResetPasswordBody {
    email?: string;
    otp?: string;
    newPassword?: string;
}

interface ChangePasswordBody {
    oldPassword?: string;
    newPassword?: string;
}

// --- Controller Actions ---

export const loginUser = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const body = req.body as LoginBody;
        const email = toTrimAndLower(body.email);
        const password = toTrim(body.password);

        if (!email || !password) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ALL_FIELDS_REQUIRED);
        }

        const user = await UserModels.findOne({ email });

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

        // 🔥 Store refresh token in Redis using userName
        await setCachedData(req.server.redis, `refreshToken:${user.userName}`, refreshToken, JWT_EXPIRY.REFRESH_TOKEN_REDIS);

        user.lastLogin = new Date();
        user.isActive = true;
        await user.save();

        const userResponse = formatEntityResponse(user);

        return sendSuccess(reply, HTTP_STATUS.OK, "Login successful", {
            accessToken,
            refreshToken,
            user: userResponse
        });
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

export const signup = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { name, email, userName, password } = req.body as SignupBody;
        const normalizedEmail = toTrimAndLower(email);
        const normalizedUserName = toTrimAndLower(userName);
        const normalizedName = toTrim(name);
        const normalizedPassword = toTrim(password);

        if (!normalizedName || !normalizedEmail || !normalizedUserName || !normalizedPassword) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ALL_FIELDS_REQUIRED);
        }

        const { otp, otpExpires } = generateOtp();

        const newUser = await UserModels.create({
            name: normalizedName,
            email: normalizedEmail,
            userName: normalizedUserName,
            password: normalizedPassword,
            status: ACCOUNT_STATUS.PENDING,
            isEmailVerified: false,
            otp,
            otpExpires,
            userType: USER_TYPES.USER
        });

        await sendVerificationEmail(newUser.email, otp);

        const userResponse = formatEntityResponse(newUser);
        return sendSuccess(reply, HTTP_STATUS.CREATED, "Registration successful. Please verify your email.", { user: userResponse });
    } catch (error: any) {
        if (error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : "User";
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, `${duplicateField} already exists`);
        }
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

export const verifyOtp = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const body = req.body as VerifyOtpBody;
        const email = toTrimAndLower(body.email);
        const otp = toTrimAndNumber(body.otp).toString();

        if (!email || !otp) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email and OTP are required");
        }

        const result = await authService.verifyOtpService(UserModels, email, otp);
        if (result.success) {
            await invalidateCache(req.server.redis);
            return sendSuccess(reply, HTTP_STATUS.OK, "Email verified successfully. You can now login.");
        }
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

export const resendOtp = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { email } = req.body as ResendOtpBody;
        const normalizedEmail = toTrimAndLower(email);

        if (!normalizedEmail) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email is required");

        const user = await UserModels.findOne({ email: normalizedEmail });
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
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

export const refreshToken = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { refreshToken } = req.body as RefreshTokenBody;

        if (!refreshToken) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Refresh token is required");
        }

        const decoded: any = await req.server.jwt.verify(refreshToken);
        const userName = decoded.userName;

        const storedToken = await getCachedData(req.server.redis, `refreshToken:${userName}`);

        if (!storedToken || storedToken !== refreshToken) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        const user = await UserModels.findOne({ userName });
        if (!user) {
            return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "User not found");
        }

        const tokens = generateTokens(req.server.jwt, user);

        await setCachedData(req.server.redis, `refreshToken:${user.userName}`, tokens.refreshToken, JWT_EXPIRY.REFRESH_TOKEN_REDIS);

        return sendSuccess(reply, HTTP_STATUS.OK, "Token refreshed successfully", {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }
};

export const logoutUser = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userName } = req.user;

        const user = await UserModels.findOne({ userName });
        if (user) {
            user.isActive = false;
            await user.save();
        }

        await deleteCachedData(req.server.redis, `refreshToken:${userName}`);

        return sendSuccess(reply, HTTP_STATUS.OK, "Logged out successfully");
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

export const forgotPassword = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { email } = req.body as ForgotPasswordBody;
        const normalizedEmail = toTrimAndLower(email);

        if (!normalizedEmail) return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Email is required");

        await authService.forgotPasswordService(UserModels, normalizedEmail);
        return sendSuccess(reply, HTTP_STATUS.OK, "Reset OTP sent to your email");
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

export const resetPassword = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { email, otp, newPassword } = req.body as ResetPasswordBody;
        const normalizedEmail = toTrimAndLower(email);
        const normalizedOtp = toTrim(otp);
        const normalizedPassword = toTrim(newPassword);

        if (!normalizedEmail || !normalizedOtp || !normalizedPassword) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "All fields are required");
        }

        await authService.resetPasswordService(UserModels, normalizedEmail, normalizedOtp, normalizedPassword);
        return sendSuccess(reply, HTTP_STATUS.OK, "Password reset successfully");
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

export const changePassword = async (req: FastifyRequest<any>, reply: FastifyReply) => {
    try {
        const { oldPassword, newPassword } = req.body as ChangePasswordBody;
        const { userName } = req.user;

        if (!oldPassword || !newPassword) {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Old and new passwords are required");
        }

        const user = await UserModels.findOne({ userName });
        if (!user) return sendError(reply, HTTP_STATUS.NOT_FOUND, "User profile not found");

        await authService.changePasswordService(user, toTrim(oldPassword), toTrim(newPassword));
        return sendSuccess(reply, HTTP_STATUS.OK, "Password changed successfully");
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.BAD_REQUEST, error.message);
    }
};

export const getMeUser = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userName } = req.user;
        const user = await UserModels.findOne({ userName }).lean();

        if (!user) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "User profile not found");
        }

        const response = formatEntityResponse(user);
        return sendSuccess(reply, HTTP_STATUS.OK, "User profile fetched successfully", { profile: response });
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};

export const getMeAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userName } = req.user;
        const admin = await AdminModels.findOne({ userName }).lean();

        if (!admin) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "Admin profile not found");
        }

        const response = formatEntityResponse(admin);
        return sendSuccess(reply, HTTP_STATUS.OK, "Admin profile fetched successfully", { profile: response });
    } catch (error: any) {
        return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
};