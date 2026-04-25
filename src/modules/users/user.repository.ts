import { User, IUser } from "../../db/models/user.model.js";

/**
 * 📦 User Repository
 * Advanced database queries with lean(), projections, and aggregations.
 */

export const userRepository = {
  /**
   * Find users with pagination and projections
   */
  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select("name email userType isActive status createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); // ⚡ High performance read

    const total = await User.countDocuments();

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  },

  /**
   * Analytics Aggregation: Get user count by type and status
   */
  async getUserStats(): Promise<any> {
    return User.aggregate([
      {
        $group: {
          _id: {
            userType: "$userType",
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id.userType",
          status: "$_id.status",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
  },

  /**
   * Find by ID with specific projection
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select("-password").lean();
  },

  /**
   * Legacy Support: Find users with options
   */
  async findUsers(query: any, options: any): Promise<IUser[]> {
    return User.find(query)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .lean();
  },

  /**
   * Legacy Support: Count users
   */
  async countUsers(query: any): Promise<number> {
    return User.countDocuments(query);
  }
};