import { Resend } from "resend";

let resendInstance: Resend | null = null;

/**
 * Lazy-initializes the Resend client to prevent startup crashes if the API key is missing.
 */
const getResendClient = () => {
    if (resendInstance) return resendInstance;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return null;
    }

    resendInstance = new Resend(apiKey);
    return resendInstance;
};

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    try {
        const resend = getResendClient();

        if (!resend) {
            console.error("❌ Email service failed: RESEND_API_KEY is missing.");
            return { success: false, error: "Missing API key" };
        }

        const { data, error } = await resend.emails.send({
            from: "Learn App <onboarding@resend.dev>",
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Email sending error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Email service exception:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Send Verification OTP Email
 */
export const sendVerificationEmail = async (email: string, otp: string) => {
    return sendEmail({
        to: email,
        subject: "Verify Your Email - Learn App",
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to Learn App!</h2>
                <p>Thank you for signing up. Please use the following code to verify your email address:</p>
                <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
        `
    });
};

/**
 * Send Password Reset OTP Email
 */
export const sendPasswordResetEmail = async (email: string, otp: string) => {
    return sendEmail({
        to: email,
        subject: "Reset Your Password - Learn App",
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Use the code below to proceed:</p>
                <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
            </div>
        `
    });
};
