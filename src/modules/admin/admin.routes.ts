import { FastifyInstance } from "fastify";
import * as adminController from "./admin.controller.js";
import * as authControllers from "../auth/auth.controller.js";

export default async function adminRoutes(app: FastifyInstance) {

    // 🔥 Admin Login
    app.post("/login", {
        schema: {
            tags: ["Admin Auth"],
            description: "Admin Login",
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            }
        }
    }, adminController.loginAdmin);

    // 🔥 Admin Logout
    app.post("/logout", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ["Admin Auth"],
            summary: "Logout admin",
            security: [{ bearerAuth: [] }]
        }
    }, adminController.logoutAdmin);

    // 🔥 Get me (Profile Detail)
    app.get("/profile", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ["Admin Auth"],
            summary: "Get current admin profile",
            security: [{ bearerAuth: [] }]
        }
    }, authControllers.getAdminDetail);


    /**
     * 👥 Admin User Management
     */

    // 🔥 Get all users
    app.get("/users", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ['Admin Users'],
            summary: 'Fetch all users',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', default: 1 },
                    limit: { type: 'number', default: 10 },
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    isActive: { type: 'boolean' },
                    userType: { type: 'string', enum: ['admin', 'user', 'guest'] },
                    search: { type: 'string' }
                }
            }
        }
    }, adminController.getAllUsers);

    // 🔥 Get single user by username
    app.get("/users/:userName", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ['Admin Users'],
            summary: 'Get a user by username',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['userName'],
                properties: {
                    userName: { type: 'string' }
                }
            }
        }
    }, adminController.getSingleUser);

    // 🔥 Update user
    app.put("/users/:userName", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ['Admin Users'],
            summary: 'Update a user',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['userName'],
                properties: {
                    userName: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    userName: { type: 'string' },
                    userType: { type: 'string', enum: ['admin', 'user', 'guest'] }
                }
            }
        }
    }, adminController.updateSingleUser);

    // 🔥 Delete multiple users
    app.delete("/users/multiple", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ['Admin Users'],
            summary: 'Delete multiple users by username',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['userNames'],
                properties: {
                    userNames: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            }
        }
    }, adminController.deleteMultipleUsers);

    // 🔥 Delete single user
    app.delete("/users/:userName", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ['Admin Users'],
            summary: 'Delete a single user by username',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['userName'],
                properties: {
                    userName: { type: 'string' }
                }
            }
        }
    }, adminController.deleteSingleUser);

    /**
     * 🔐 Admin Account Security
     */

    // 🔥 Verify OTP
    app.post("/verify-otp", {
        schema: {
            tags: ['Admin Auth'],
            summary: 'Verify admin email with OTP',
            body: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' }
                }
            }
        }
    }, adminController.verifyOtp);

    // 🔥 Forgot password
    app.post("/forgot-password", {
        schema: {
            tags: ['Admin Auth'],
            summary: 'Request admin password reset OTP',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            }
        }
    }, adminController.forgotPassword);

    // 🔥 Reset password
    app.post("/reset-password", {
        schema: {
            tags: ['Admin Auth'],
            summary: 'Reset admin password using OTP',
            body: {
                type: 'object',
                required: ['email', 'otp', 'newPassword'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' },
                    newPassword: { type: 'string' }
                }
            }
        }
    }, adminController.resetPassword);

    // 🔥 Change password
    app.patch("/change-password", {
        onRequest: [app.authenticateAdmin],
        schema: {
            tags: ['Admin Auth'],
            summary: 'Change admin password (authenticated)',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                    oldPassword: { type: 'string' },
                    newPassword: { type: 'string' }
                }
            }
        }
    }, adminController.changePassword);
}