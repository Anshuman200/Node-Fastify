import { authRepository } from "./auth.repository.js";
import { responseUtil } from "../../utils/response/response.util.js";
import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { cacheUtil } from "../../utils/cache/cache.util.js";
import { authUtil } from "../../utils/auth/auth.util.js";

export const authService = (app: FastifyInstance) => {
  const cache = cacheUtil(app);
  const auth = authUtil(app);

  return {
    /**
     * 🔐 Login
     */
    async login(credentials: { email: string; password: string }) {
      const { email, password } = credentials;

      const user = await authRepository.findByEmailWithPassword(email) as any;

      if (!user) {
        return responseUtil.error("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return responseUtil.error("Invalid credentials");
      }

      // ✅ Generate Tokens using helpers
      const payload = { id: user._id, email: user.email, userType: user.userType };
      const accessToken = auth.signAccessToken(payload);
      const refreshToken = auth.signRefreshToken(payload);

      // ✅ Support multi-device sessions
      const sessionKey = `refresh:${user._id}:${Date.now()}`;
      await cache.setCache(sessionKey, refreshToken, 7 * 24 * 60 * 60);

      await authRepository.updateLastLogin(user._id.toString());

      const { password: _, ...userWithoutPassword } = user;

      return responseUtil.success("Login successful", {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      });
    },

    /**
     * 🚪 Logout
     */
    async logout(token: string) {
      try {
        // ✅ Decode token safely
        const decoded = auth.verifyToken(token) as any;
        const userId = decoded.id;

        // ✅ Get actual expiry from token for blacklisting
        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - now;

        if (ttl > 0) {
          await cache.setCache(`blacklist:${token}`, "1", ttl);
        }

        // ✅ Delete all sessions for user using pattern helper
        await cache.deleteByPattern(`refresh:${userId}:*`);

        return responseUtil.success("Logout successful");
      } catch (err) {
        return responseUtil.error("Invalid token");
      }
    }
  };
};