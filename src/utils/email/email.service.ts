import { Resend } from "resend";

let resendInstance: Resend | null = null;

type EmailResult =
    | { success: true; id: string }
    | { success: false; error: string };

interface SendEmailParams {
    apiKey: string;
    to: string;
    subject: string;
    html: string;
}

/**
 * 🔐 Lazy init Resend client (singleton)
 */
const getClient = (apiKey: string): Resend => {
    if (!resendInstance) {
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
};

/**
 * 📧 Send Email (Production-safe)
 */
export const sendEmail = async ({
    apiKey,
    to,
    subject,
    html,
}: SendEmailParams): Promise<EmailResult> => {
    try {
        const resend = getClient(apiKey);

        const { data, error } = await resend.emails.send({
            from: "Learn App <noreply@yourdomain.com>", // ⚠️ replace with verified domain
            to,
            subject,
            html,
        });

        if (error) {
            return {
                success: false,
                error: error.message || "Email failed",
            };
        }

        return {
            success: true,
            id: data?.id || "unknown",
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
};