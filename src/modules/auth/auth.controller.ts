import { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "./auth.service.js";
import { responseUtil } from "../../utils/response/response.util.js";

/**
 * 🎮 Auth Controller Actions
 */

/**
 * Handle Login
 */
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const service = authService(request.server);
  const result = await service.login(request.body as any);

  if (!result.success) {
    return reply.status(401).send(result);
  }

  return reply.status(200).send(result);
};

/**
 * Handle Logout
 */
export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const service = authService(request.server);
  const token = request.headers.authorization?.replace("Bearer ", "");

  const result = await service.logout(token || "");
  return reply.status(200).send(result);
};

/**
 * Get Current User Profile (Admin/User)
 */
export const getUserDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as any;

  if (!user) {
    return reply.status(401).send(responseUtil.error("Unauthorized: No user session found"));
  }

  return reply.status(200).send(responseUtil.success("Profile fetched successfully", { user }));
};

/**
 * Legacy Support: Alias for getMe
 */
export const getAdminDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  return getUserDetail(request, reply);
};

// Also export as a default object for convenience
export const authController = {
  login,
  logout,
  getUserDetail,
  getAdminDetail
};