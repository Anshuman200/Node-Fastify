import crypto from "crypto";
import { env } from "../../config/env.js";

/**
 * 🔐 Crypto Utilities
 * Handles signatures, hashing, and secure comparisons.
 */

export const cryptoUtil = {
  /**
   * Generates a SHA256 HMAC signature for a payload
   */
  generateSignature(payload: string): string {
    return crypto
      .createHmac("sha256", env.SIGNATURE_SECRET)
      .update(payload)
      .digest("hex");
  },

  /**
   * Constant-time comparison to prevent timing attacks
   */
  verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    
    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  },

  /**
   * Generate a random string (e.g., for API keys or salts)
   */
  generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }
};
