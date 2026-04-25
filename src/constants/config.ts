export const ALLOWED_ORIGINS = [
    "http://localhost:3333",
    "http://127.0.0.1:3333",
    "http://localhost:3000"
];

export const JWT_EXPIRY = {
    ACCESS_TOKEN: "1m",
    REFRESH_TOKEN: "7d",
    REFRESH_TOKEN_REDIS: 7 * 24 * 60 * 60 // 7 days in seconds
} as const;

export const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_IN_MINUTES: 10
} as const;

export const DEFAULT_ADMIN = {
    name: process.env.ADMIN_NAME || "SuperAdmin",
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    userName: process.env.ADMIN_USERNAME || "superadmin",
    password: process.env.ADMIN_PASSWORD || "Ansh@123"
} as const;

export const DOCS_AUTH = {
    username: process.env.SWAGGER_USER || "admin",
    password: process.env.SWAGGER_PASSWORD || "admin123"
} as const;

export const MAX_REQUEST_PER_MINUTE = 100;

export const AWS_CONFIG = {
    REGION: process.env.AWS_REGION || "ap-south-1",
    SECRET_NAME: process.env.AWS_SECRET_NAME || "fastify-redis"
} as const;