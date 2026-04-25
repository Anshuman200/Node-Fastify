import { FastifyReply, FastifyRequest } from "fastify";
import { responseUtil } from "../../utils/response/response.util.js";

/**
 * 🎭 Role-Based Access Control Middleware (Production Ready)
 */

type UserRole = "user" | "admin";

export const authorize = (allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    // 🔐 Ensure authentication ran before RBAC
    if (!user) {
      return reply
        .code(401)
        .send(responseUtil.error("Unauthorized"));
    }

    // 🔐 Ensure role exists
    if (!user.userType) {
      return reply
        .code(403)
        .send(responseUtil.error("Forbidden"));
    }

    // 🚫 Role check
    if (!allowedRoles.includes(user.userType as UserRole)) {
      return reply
        .code(403)
        .send(responseUtil.error("Forbidden"));
    }
  };
};