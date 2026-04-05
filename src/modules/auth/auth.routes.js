// routes/authRoutes.js

import * as authControllers from "./auth.controller.js";
import { USER_TYPES } from "../../constants/status.js";

export default async function authRoutes(app) {

    // 🔥 Login user
    app.post("/login", {
        schema: {
            tags: ['User Auth'],
            summary: 'Login a user',
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    userType: { type: 'string', enum: [USER_TYPES.USER, USER_TYPES.GUEST], default: USER_TYPES.USER }
                }
            }
        }
    }, authControllers.loginUser);



    // 🔥 Signup user
    app.post("/signup", {
        schema: {
            tags: ['User Auth'],
            summary: 'Sign up a new user',
            body: {
                type: 'object',
                required: ['name', 'email', 'userName', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    userName: { type: 'string' },
                    password: { type: 'string' },
                    userType: { type: 'string', enum: [USER_TYPES.USER], default: USER_TYPES.USER }
                }
            }
        }
    }, authControllers.signup);

    // 🔥 Verify OTP
    app.post("/verify-otp", {
        schema: {
            tags: ['User Auth'],
            summary: 'Verify email with OTP',
            body: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' }
                }
            }
        }
    }, authControllers.verifyOtp);

    // 🔥 Resend OTP
    app.post("/resend-otp", {
        schema: {
            tags: ['User Auth'],
            summary: 'Resend verification OTP',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            }
        }
    }, authControllers.resendOtp);



    // 🔥 Refresh token
    app.post("/refresh", {
        schema: {
            tags: ['User Auth'],
            summary: 'Refresh access token',
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                    refreshToken: { type: 'string' }
                }
            }
        }
    }, authControllers.refreshToken);

    // 🔥 Logout user
    app.post("/logout", {
        onRequest: [app.authenticate],
        schema: {
            tags: ['User Auth'],
            summary: 'Logout a user',
            security: [{ bearerAuth: [] }]
        }
    }, authControllers.logoutUser);

    // 🔥 Forgot password
    app.post("/forgot-password", {
        schema: {
            tags: ['User Auth'],
            summary: 'Request password reset OTP',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            }
        }
    }, authControllers.forgotPassword);

    // 🔥 Reset password
    app.post("/reset-password", {
        schema: {
            tags: ['User Auth'],
            summary: 'Reset password using OTP',
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
    }, authControllers.resetPassword);

    // 🔥 Change password
    app.patch("/change-password", {
        onRequest: [app.authenticate],
        schema: {
            tags: ['User Auth'],
            summary: 'Change password (authenticated)',
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
    }, authControllers.changePassword);

    // 🔥 Get me (Profile Detail)
    app.get("/me", {
        onRequest: [app.authenticateUser],
        schema: {
            tags: ['User Auth'],
            summary: 'Get current user profile',
            security: [{ bearerAuth: [] }]
        }
    }, authControllers.getMeUser);
}