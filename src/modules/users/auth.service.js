import { generateOtp } from "./user.helper.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../core/email/emailService.js";

/**
 * 🔐 Shared business logic for Forgot Password
 * @param {Object} Model - Mongoose Model (User or Admin)
 * @param {String} email - Encoded/Sanitized email
 * @returns {Object} - Success status and message
 */
export const forgotPasswordService = async (Model, email) => {
    const user = await Model.findOne({ email });
    if (!user) throw new Error("Entity not found with this email");

    const { otp, otpExpires } = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendPasswordResetEmail(user.email, otp);
    return { success: true, message: "Reset OTP sent to your email" };
};

/**
 * 🔐 Shared business logic for OTP Verification
 * @param {Object} Model - Mongoose Model
 * @param {String} email - Encoded email
 * @param {String} otp - The OTP to verify
 * @returns {Object} - Success status and the verified entity
 */
export const verifyOtpService = async (Model, email, otp) => {
    const user = await Model.findOne({
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
 * @param {Object} Model - Mongoose Model
 * @param {String} email - Encoded email
 * @param {String} otp - The OTP to verify
 * @param {String} newPassword - The new password (unhashed)
 * @returns {Object} - Success status
 */
export const resetPasswordService = async (Model, email, otp, newPassword) => {
    const user = await Model.findOne({
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
 * @param {Object} userDoc - The Mongoose document (User or Admin)
 * @param {String} oldPassword - The currently provided password
 * @param {String} newPassword - The new password
 * @returns {Object} - Success status
 */
export const changePasswordService = async (userDoc, oldPassword, newPassword) => {
    const isMatch = await userDoc.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Incorrect old password");

    userDoc.password = newPassword;
    await userDoc.save();

    return { success: true, message: "Password changed successfully" };
};
