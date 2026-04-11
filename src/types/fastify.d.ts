import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { JWT } from "@fastify/jwt";
import { Redis } from "ioredis";
import { IUser } from "../modules/users/user.model.js";
import { IAdmin } from "../modules/admin/admin.model.js";

declare module "fastify" {
  interface FastifyInstance {
    jwt: JWT;
    redis: Redis;
    mongo: any;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: {
      id: string;
      email?: string;
      userName: string;
      userType: string;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email?: string;
      userName: string;
      userType: string;
    };
    user: {
      id: string;
      email?: string;
      userName: string;
      userType: string;
    };
  }
}
