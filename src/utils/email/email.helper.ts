import { sendEmail } from "./email.service.js";
import { buildOtpTemplate } from "./templates.js";

/**
 * 📧 Send Verification Email
 */
export const sendVerificationEmail = async (
    apiKey: string,
    email: string,
    otp: string
) => {
    return sendEmail({
        apiKey,
        to: email,
        subject: "Verify Your Email",
        html: buildOtpTemplate({
            title: "Verify Your Email",
            message: "Use the code below to verify your account:",
            otp,
        }),
    });
};

/**
 * 🔐 Send Password Reset Email
 */
export const sendPasswordResetEmail = async (
    apiKey: string,
    email: string,
    otp: string
) => {
    return sendEmail({
        apiKey,
        to: email,
        subject: "Reset Your Password",
        html: buildOtpTemplate({
            title: "Password Reset",
            message: "Use the code below to reset your password:",
            otp,
        }),
    });
};