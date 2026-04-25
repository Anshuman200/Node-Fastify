import { FastifyInstance } from "fastify";
import { Model, Document } from "mongoose";
import { generateOtp } from "./user.helper.js";
import { addEmailJob } from "../../queue/jobs/email.job.js";
import { JobPriority } from "../../queue/types.js";

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
 * @param {FastifyInstance} app - Fastify instance for queue access
 * @param {Model<AuthEntity>} AuthModel - Mongoose Model (User or Admin)
 * @param {String} email - Encoded/Sanitized email
 */
export const forgotPasswordService = async (app: FastifyInstance, AuthModel: Model<any>, email: string) => {
    const user = await AuthModel.findOne({ email });
    if (!user) throw new Error("Entity not found with this email");

    const { otp, otpExpires } = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await addEmailJob(app, {
        to: user.email,
        subject: "Password Reset OTP",
        type: "RESET_PASSWORD",
        otp: otp
    }, { priority: JobPriority.HIGH });
    
    return { success: true, message: "Reset OTP sent to your email" };
};

/**
 * 🔐 Shared business logic for OTP Verification
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
 */
export const changePasswordService = async (userDoc: any, oldPassword: string, newPassword: string) => {
    const isMatch = await userDoc.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Incorrect old password");

    userDoc.password = newPassword;
    await userDoc.save();

    return { success: true, message: "Password changed successfully" };
};
