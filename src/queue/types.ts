/**
 * 🏷️ BullMQ Job Types & Interfaces
 */

export enum JobPriority {
  LOW = 3,
  MEDIUM = 2,
  HIGH = 1, // ✅ BullMQ: Lower value = Higher priority
}

export interface EmailJobData {
  to: string;
  subject?: string;
  template?: string;
  context?: {
    apiKey?: string;
    message?: string;
    [key: string]: any;
  };
  otp?: string;
  type: "WELCOME" | "OTP" | "RESET_PASSWORD" | "NOTIFICATION";
}

export interface NotificationJobData {
  userId: string;
  title: string;
  body: string;
  type: "PUSH" | "SMS" | "WHATSAPP";
  metadata?: Record<string, any>;
}

export interface AnalyticsJobData {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: number;
}
