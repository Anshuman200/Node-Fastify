import { FastifyInstance } from "fastify";
import { env } from "../../config/env.js";

/**
 * 🔐 Auth & JWT Utilities
 */

export const authUtil = (app: FastifyInstance) => {
  return {
    /**
     * Sign an access token
     */
    signAccessToken(payload: any) {
      return app.jwt.sign(payload, {
        expiresIn: env.JWT_ACCESS_EXPIRATION || "1h"
      });
    },

    /**
     * Sign a refresh token
     */
    signRefreshToken(payload: any) {
      return app.jwt.sign({ ...payload, type: "refresh" }, {
        expiresIn: env.JWT_REFRESH_EXPIRATION || "7d"
      });
    },

    /**
     * Verify a token
     */
    verifyToken(token: string) {
      return app.jwt.verify(token);
    }
  };
};
