export const ALLOWED_ORIGINS = [
    "http://localhost:3333",
    "http://127.0.0.1:3333"
];

export const JWT_EXPIRY = {
    ACCESS_TOKEN: "15m",
    REFRESH_TOKEN: "7d",
    REFRESH_TOKEN_REDIS: 7 * 24 * 60 * 60 // 7 days in seconds
};

export const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_IN_MINUTES: 10
};

export const DEFAULT_ADMIN = {
    name: process.env.ADMIN_NAME || "SuperAdmin",
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    userName: process.env.ADMIN_USERNAME || "superadmin",
    password: process.env.ADMIN_PASSWORD || "Ansh@123"
};
