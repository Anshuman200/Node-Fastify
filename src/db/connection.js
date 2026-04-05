import mongoose from "mongoose";

export async function connectDB(uri, logger) {
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
    } catch (error) {
        logger.error("❌ MongoDB connection failed", error);
        throw error; // let plugin decide what to do
    }
}

export async function disconnectDB(logger) {
    try {
        await mongoose.connection.close();
        logger.info("🛑 MongoDB disconnected");
    } catch (error) {
        logger.error("❌ Error while disconnecting DB", error);
    }
}