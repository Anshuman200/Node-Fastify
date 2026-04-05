import { JWT_EXPIRY } from "../../constants/config.js";

/**
 * 🔑 Helper for generating admin tokens
 * @param {Object} jwt - The fastify-jwt instance
 * @param {Object} admin - The admin document
 * @returns {Object} - An object containing accessToken and refreshToken
 */
export const generateAdminTokens = (jwt, admin) => {
    const accessToken = jwt.sign(
        { id: admin._id, email: admin.email, userName: admin.userName, userType: admin.userType },
        { expiresIn: JWT_EXPIRY.ACCESS_TOKEN }
    );
    const refreshToken = jwt.sign(
        { id: admin._id, userName: admin.userName },
        { expiresIn: JWT_EXPIRY.REFRESH_TOKEN }
    );
    return { accessToken, refreshToken };
};
