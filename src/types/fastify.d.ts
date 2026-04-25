import "fastify";
import { Queue } from "bullmq";
import { JWT } from "@fastify/jwt";
import { Redis } from "ioredis";

/**
 * 🧠 Shared User Type (Single Source of Truth)
 */
export type AuthUser = {
  id: string;
  email?: string;
  userName?: string;
  userType: "user" | "admin" | "sub-admin" | "guest";
};

/**
 * 🔐 Fastify Instance Extensions
 */
declare module "fastify" {
  interface FastifyInstance {
    jwt: JWT;
    redis: Redis;

    // 🚜 BullMQ Queues
    queues: {
      email: Queue;
      notification: Queue;
      analytics: Queue;
    };

    // 🔐 Secrets (from AWS / env)
    secrets: {
      JWT_SECRET: string;
      SIGNATURE_SECRET: string;
      API_KEYS: Record<string, string>;
    };

    // 🔐 Auth methods
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: AuthUser;
    client?: string; // API key client
  }
}

/**
 * 🔐 Secure Session Types
 */
declare module "@fastify/secure-session" {
  interface SessionData {
    user: AuthUser;
  }
}

/**
 * 🔐 JWT Types (CRITICAL)
 */
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      userType: "user" | "admin" | "sub-admin" | "guest";
      email?: string;
      userName?: string;
      type?: "access" | "refresh";
    };

    user: AuthUser;
  }
}