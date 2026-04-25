import "dotenv/config";
import { loadSecrets, validateEnv } from "../utils/secrets.js";
import { AWS_CONFIG } from "../constants/config.js";

/**
 * 🌍 Application Environment Configuration
 * Centralized, type-safe environment variable management.
 */

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3333,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || "",
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret",
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || "1h",
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "7d",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "default_cookie_secret",
  API_KEY_SECRET: process.env.API_KEY_SECRET || "default_api_key_secret",
  SIGNATURE_SECRET: process.env.SIGNATURE_SECRET || "default_signature_secret",
  
  // External Services
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  
  // AWS (Internal)
  AWS_REGION: process.env.AWS_REGION || AWS_CONFIG.REGION,
  AWS_SECRET_NAME: process.env.AWS_SECRET_NAME || AWS_CONFIG.SECRET_NAME,
};

/**
 * Ensures all required environment variables are loaded.
 * This should be called at the very beginning of the application lifecycle.
 */
export async function initializeConfig() {
  // 1. Load secrets from AWS if configured
  if (env.AWS_SECRET_NAME) {
    const secrets = await loadSecrets(env.AWS_SECRET_NAME, env.AWS_REGION);
    if (secrets.success && secrets.data) {
      // Re-map secrets to our env object if they were injected into process.env
      env.MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI;
      env.REDIS_HOST = process.env.REDIS_HOST || env.REDIS_HOST;
      env.REDIS_PORT = Number(process.env.REDIS_PORT) || env.REDIS_PORT;
      env.REDIS_PASSWORD = process.env.REDIS_PASSWORD || env.REDIS_PASSWORD;
      env.RESEND_API_KEY = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
      env.JWT_SECRET = process.env.JWT_SECRET || env.JWT_SECRET;
      env.JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || env.JWT_ACCESS_EXPIRATION;
      env.JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || env.JWT_REFRESH_EXPIRATION;
      env.COOKIE_SECRET = process.env.COOKIE_SECRET || env.COOKIE_SECRET;
      env.API_KEY_SECRET = process.env.API_KEY_SECRET || env.API_KEY_SECRET;
      env.SIGNATURE_SECRET = process.env.SIGNATURE_SECRET || env.SIGNATURE_SECRET;
    }
  }

  // 2. Validate essential variables
  const requiredVars = [
    "MONGODB_URI",
    "REDIS_HOST",
    "REDIS_PORT",
    "JWT_SECRET",
    "COOKIE_SECRET",
    "SIGNATURE_SECRET"
  ];

  validateEnv(requiredVars);
  
  console.log("✅ Configuration initialized successfully");
}
