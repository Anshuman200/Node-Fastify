import { Admin } from "../../db/models/admin.model.js";
import { Content } from "../../db/models/content.model.js";
import { DEFAULT_ADMIN } from "../../constants/config.js";

/**
 * 🌱 Database Seeder Utility
 * Ensures essential data exists in the database on startup.
 */

export const seeder = {
  /**
   * Seed Default Admin
   */
  async seedAdmin() {
    const adminCount = await Admin.estimatedDocumentCount();
    if (adminCount === 0) {
      await Admin.create({
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        userName: DEFAULT_ADMIN.userName,
        password: DEFAULT_ADMIN.password,
        userType: "admin",
        status: "active",
        isEmailVerified: true
      });
      console.log("✅ Default Admin seeded successfully");
    }
  },

  /**
   * Seed Common Content (Terms, Privacy, etc.)
   */
  async seedContent() {
    const contents = [
      {
        key: "terms",
        title: "Terms of Service",
        content: "<h1>Terms of Service</h1><p>Welcome to our platform. By using our services, you agree to these terms...</p>"
      },
      {
        key: "privacy",
        title: "Privacy Policy",
        content: "<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we handle your data...</p>"
      },
      {
        key: "about",
        title: "About Us",
        content: "<h1>About Us</h1><p>We are a high-performance API engine built with Fastify and Node.js.</p>"
      }
    ];

    for (const item of contents) {
      const exists = await Content.findOne({ key: item.key });
      if (!exists) {
        await Content.create(item);
        console.log(`✅ Content seeded: ${item.key}`);
      }
    }
  },

  /**
   * Run All Seeders
   */
  async run() {
    try {
      console.log("🌱 Database seeding: Starting Admin and Content tasks...");
      await Promise.all([
        this.seedAdmin(),
        this.seedContent()
      ]);
      console.log("✅ Database seeding: All tasks completed successfully.");
    } catch (err) {
      console.error("❌ Database seeding: Error occurred:", err);
      // We don't throw here to prevent the whole app from crashing if seeding fails
    }
  }
};
