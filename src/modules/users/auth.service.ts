import { Model, Document } from "mongoose";
import { generateOtp } from "./user.helper.js";
import { sendPasswordResetEmail } from "../../utils/email/email.helper.js";
import { env } from "../../config/env.js";

interface AuthEntity extends Document {
    email: string;
    otp: string | null;
    otpExpires: Date | null;
    isEmailVerified?: boolean;
    status?: string;
    isActive?: boolean;
    password?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * 🔐 Shared business logic for Forgot Password
 * @param {Model<AuthEntity>} AuthModel - Mongoose Model (User or Admin)
 * @param {String} email - Encoded/Sanitized email
 * @returns {Object} - Success status and message
 */
export const forgotPasswordService = async (AuthModel: Model<any>, email: string) => {
    const user = await AuthModel.findOne({ email });
    if (!user) throw new Error("Entity not found with this email");

    const { otp, otpExpires } = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendPasswordResetEmail(env.RESEND_API_KEY, user.email, otp);
    return { success: true, message: "Reset OTP sent to your email" };
};

/**
 * 🔐 Shared business logic for OTP Verification
 * @param {Model<any>} AuthModel - Mongoose Model
 * @param {String} email - Encoded email
 * @param {String} otp - The OTP to verify
 * @returns {Object} - Success status and the verified entity
 */
export const verifyOtpService = async (AuthModel: Model<any>, email: string, otp: string) => {
    const user = await AuthModel.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error("Invalid or expired OTP");

    user.isEmailVerified = true;
    if (user.status) user.status = "active";
    if (user.isActive !== undefined) user.isActive = true;
    
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { success: true, user };
};

/**
 * 🔐 Shared business logic for Reset Password
 * @param {Model<any>} AuthModel - Mongoose Model
 * @param {String} email - Encoded email
 * @param {String} otp - The OTP to verify
 * @param {String} newPassword - The new password (unhashed)
 * @returns {Object} - Success status
 */
export const resetPasswordService = async (AuthModel: Model<any>, email: string, otp: string, newPassword: string) => {
    const user = await AuthModel.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error("Invalid or expired OTP");

    user.password = newPassword; // Pre-save hook will hash it
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { success: true, message: "Password reset successfully" };
};

/**
 * 🔐 Shared business logic for Change Password
 * @param {any} userDoc - The Mongoose document (User or Admin)
 * @param {String} oldPassword - The currently provided password
 * @param {String} newPassword - The new password
 * @returns {Object} - Success status
 */
export const changePasswordService = async (userDoc: any, oldPassword: string, newPassword: string) => {
    const isMatch = await userDoc.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Incorrect old password");

    userDoc.password = newPassword;
    await userDoc.save();

    return { success: true, message: "Password changed successfully" };
};
