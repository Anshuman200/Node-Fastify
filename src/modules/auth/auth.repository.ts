import { User, IUser } from "../../db/models/user.model.js";

/**
 * 📦 Auth Repository
 * Direct database access for authentication purposes.
 */

export const authRepository = {
  /**
   * Find user by email with password included for authentication
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+password").lean();
  },

  /**
   * Find user by ID for session validation
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).lean();
  },

  /**
   * Create new user
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  },

  /**
   * Update user last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }
};
