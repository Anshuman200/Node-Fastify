import mongoose, { Connection } from "mongoose";
import { FastifyBaseLogger } from "fastify";
import { env } from "../config/env.js";

/**
 * 🗄️ MongoDB Connection Manager (Production Ready)
 */

let cachedConnection: Connection | null = null;
let isConnecting = false;

/**
 * 🚀 Connect to MongoDB
 */
export async function connectDB(
    logger: FastifyBaseLogger
): Promise<Connection> {
    if (cachedConnection) {
        logger.info("ℹ️ Using existing MongoDB connection");
        return cachedConnection;
    }

    if (isConnecting) {
        logger.warn("⏳ MongoDB connection already in progress...");
        return mongoose.connection;
    }

    const uri = env.MONGODB_URI;

    if (!uri) {
        throw new Error("❌ MONGODB_URI is missing");
    }

    try {
        isConnecting = true;

        // 🔧 Global mongoose settings
        mongoose.set("strictQuery", true);

        const mongooseInstance = await mongoose.connect(uri, {
            maxPoolSize: 20,            // max concurrent connections
            minPoolSize: 5,             // keep warm connections
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            autoIndex: env.NODE_ENV !== "production", // disable in prod
        });

        cachedConnection = mongooseInstance.connection;
        isConnecting = false;

        logger.info("✅ MongoDB connected successfully");

        attachConnectionEvents(logger);

        return cachedConnection;

    } catch (error: any) {
        isConnecting = false;
        logger.error("❌ MongoDB connection failed", error);
        throw error;
    }
}

/**
 * 🛑 Disconnect MongoDB
 */
export async function disconnectDB(
    logger: FastifyBaseLogger
): Promise<void> {
    try {
        if (!cachedConnection) {
            logger.warn("⚠️ No MongoDB connection to close");
            return;
        }

        await mongoose.connection.close();
        cachedConnection = null;

        logger.info("🛑 MongoDB disconnected cleanly");
    } catch (error: any) {
        logger.error("❌ Error disconnecting MongoDB", error);
    }
}

/**
 * 🔁 Attach MongoDB event listeners
 */
function attachConnectionEvents(logger: FastifyBaseLogger) {
    const conn = mongoose.connection;

    conn.on("connected", () => {
        logger.info("📡 MongoDB connection established");
    });

    conn.on("error", (err) => {
        logger.error("❌ MongoDB error", err);
    });

    conn.on("disconnected", () => {
        logger.warn("⚠️ MongoDB disconnected");
    });

    conn.on("reconnected", () => {
        logger.info("🔄 MongoDB reconnected");
    });
}

/**
 * ⚙️ Graceful Shutdown Handler
 */
export function setupGracefulShutdown(logger: FastifyBaseLogger) {
    const shutdown = async (signal: string) => {
        try {
            logger.info(`📴 Received ${signal}. Closing MongoDB connection...`);
            await mongoose.connection.close();
            process.exit(0);
        } catch (error: any) {
            logger.error("❌ Error during shutdown", error);
            process.exit(1);
        }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}