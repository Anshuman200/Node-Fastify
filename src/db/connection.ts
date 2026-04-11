import mongoose from "mongoose";
import { FastifyBaseLogger } from "fastify";

export async function connectDB(uri: string | undefined, logger: FastifyBaseLogger) {
    if (!uri) {
        throw new Error("❌ MONGODB_URI is missing");
    }

    try {
        const connection = await mongoose.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info("✅ MongoDB connected");

        return connection;
    } catch (error:any) {
        logger.error("❌ MongoDB connection failed", error);
        throw error; // let plugin decide what to do
    }
}

export async function disconnectDB(logger: FastifyBaseLogger) {
    try {
        await mongoose.connection.close();
        logger.info("🛑 MongoDB disconnected");
    } catch (error:any) {
        logger.error("❌ Error while disconnecting DB", error);
    }
}