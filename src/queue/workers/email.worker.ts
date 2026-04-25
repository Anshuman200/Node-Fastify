import { Worker, Job, ConnectionOptions } from "bullmq";
import { FastifyBaseLogger } from "fastify";
import { EmailJobData } from "../types.js";
import {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../utils/email/email.helper.js";
import { env } from "../../config/env.js";

/**
 * 📧 Email Worker (Production Hardened)
 */
export const createEmailWorker = (
  connection: ConnectionOptions,
  logger: FastifyBaseLogger
) => {
  const worker = new Worker<EmailJobData>(
    "email-queue",
    async (job: Job<EmailJobData>) => {
      const start = Date.now();
      const { to, type, otp, context, subject } = job.data;

      if (!to || !type) throw new Error("Invalid email job payload");

      const apiKey = context?.apiKey || env.RESEND_API_KEY;

      try {
        await withTimeout(
          processEmailJob(apiKey, { to, type, otp, context, subject }),
          15000 // 15s timeout
        );

        const duration = Date.now() - start;
        logger.info({ msg: "Job completed", jobId: job.id, type, duration, to });
        
        return { success: true, duration };
      } catch (err: any) {
        logger.error({ msg: "Job failed", jobId: job.id, type, error: err.message, to });
        throw err; // Trigger BullMQ retry
      }
    },
    {
      connection,
      concurrency: 5,
      lockDuration: 30000,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  /**
   * 🚨 Exhausted Retries / Dead Letter logic
   */
  worker.on("failed", (job, err) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
      logger.error({
        msg: "❌ FATAL: Email job exhausted retries",
        jobId: job.id,
        data: job.data,
        error: err.message
      });
    }
  });

  worker.on("stalled", (jobId) => {
    logger.warn({ msg: "⚠️ Job stalled", jobId });
  });

  return worker;
};

/**
 * 🧠 Core Email Processing Logic
 */
async function processEmailJob(apiKey: string, data: EmailJobData) {
  const { to, type, otp, context, subject } = data;

  switch (type) {
    case "OTP":
      if (!otp) throw new Error("OTP required");
      await sendVerificationEmail(apiKey, to, otp);
      break;

    case "RESET_PASSWORD":
      if (!otp) throw new Error("OTP required");
      await sendPasswordResetEmail(apiKey, to, otp);
      break;

    default:
      await sendEmail({
        apiKey,
        to,
        subject: subject || "Notification",
        html: context?.message || "Hello!",
      });
  }
}

/**
 * ⏱️ Timeout Helper
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Job execution timeout")), ms)
    ),
  ]);
}