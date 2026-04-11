import { JWT_EXPIRY, OTP_CONFIG } from "../../constants/config.js";
import { IUser } from "./user.model.js";

/**
 * 🔑 Helper for cache key
 * @param {Object} query - The request query object
 * @returns {String} - A stringified cache key
 */
export const buildCacheKey = (query: any): string => {
    return `users:${JSON.stringify(query)}`;
};

/**
 * 🔑 Helper for generating tokens
 * @param {any} jwt - The fastify-jwt instance
 * @param {IUser} user - The user document
 * @returns {Object} - An object containing accessToken and refreshToken
 */
export const generateTokens = (jwt: any, user: IUser) => {
    const accessToken = jwt.sign(
        { id: user._id, email: user.email, userName: user.userName, userType: user.userType },
        { expiresIn: JWT_EXPIRY.ACCESS_TOKEN }
    );
    const refreshToken = jwt.sign(
        { id: user._id, userName: user.userName },
        { expiresIn: JWT_EXPIRY.REFRESH_TOKEN }
    );
    return { accessToken, refreshToken };
};

/**
 * 🔑 Helper for generating a configurable digit OTP and expiry time
 * @param {number} length - The length of the OTP (default from config)
 * @returns {Object} - An object containing otp and otpExpires
 */
export const generateOtp = (length: number = OTP_CONFIG.LENGTH) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();

    const otpExpires = new Date(Date.now() + OTP_CONFIG.EXPIRY_IN_MINUTES * 60 * 1000);
    return { otp, otpExpires };
};
