import { AdminModels } from "../modules/admin/admin.model.js";
import { DEFAULT_ADMIN } from "../constants/config.js";
import { ACCOUNT_STATUS, USER_TYPES } from "../constants/status.js";
import { FastifyBaseLogger } from "fastify";

/**
 * 🌱 Seed the default admin user if it doesn't exist.
 */
export const seedAdmin = async (logger?: FastifyBaseLogger) => {
    try {
        const existingAdmin = await AdminModels.findOne({ email: DEFAULT_ADMIN.email });

        if (existingAdmin) {
            if (logger) logger.info(`ℹ️ Admin already exists: ${DEFAULT_ADMIN.email}`);
            return;
        }

        await AdminModels.create({
            name: DEFAULT_ADMIN.name,
            email: DEFAULT_ADMIN.email,
            userName: DEFAULT_ADMIN.userName,
            password: DEFAULT_ADMIN.password,
            isEmailVerified: true,
            userType: USER_TYPES.ADMIN,
            status: ACCOUNT_STATUS.ACTIVE
        });

        if (logger) logger.info(`✅ Default admin seeded: ${DEFAULT_ADMIN.email}`);
    } catch (error: any) {
        if (logger) logger.error(`❌ Admin seeding failed: ${error.message}`);
        else console.error(`❌ Admin seeding failed: ${error.message}`);
    }
};
