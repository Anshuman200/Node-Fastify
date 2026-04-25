import { FastifyInstance } from "fastify";
import * as adminController from "./admin.controller.js";
import * as authControllers from "../auth/auth.controller.js";
import * as schemas from "./admin.schema.js";

/**
 * 🏢 Admin Routes (Schema Integrated)
 */

export default async function adminRoutes(app: FastifyInstance) {

    // 🔓 Admin Login
    app.post("/login", {
        schema: schemas.adminLoginSchema
    }, adminController.loginAdmin);

    // 🛡️ Admin Logout
    app.post("/logout", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.adminLogoutSchema
    }, adminController.logoutAdmin);

    // 👤 Admin Profile
    app.get("/profile", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.adminProfileSchema
    }, authControllers.getAdminDetail);


    /**
     * 👥 User Management (Admin Only)
     */

    app.get("/users", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.getAllUsersSchema
    }, adminController.getAllUsers);

    app.get("/users/:userName", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.getSingleUserSchema
    }, adminController.getSingleUser);

    app.put("/users/:userName", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.updateUserSchema
    }, adminController.updateSingleUser);

    app.delete("/users/multiple", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.deleteMultipleUsersSchema
    }, adminController.deleteMultipleUsers);

    app.delete("/users/:userName", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.deleteSingleUserSchema
    }, adminController.deleteSingleUser);


    /**
     * 🔐 Admin Account Security
     */

    app.post("/verify-otp", {
        schema: schemas.verifyOtpSchema
    }, adminController.verifyOtp);

    app.post("/forgot-password", {
        schema: schemas.forgotPasswordSchema
    }, adminController.forgotPassword);

    app.post("/reset-password", {
        schema: schemas.resetPasswordSchema
    }, adminController.resetPassword);

    app.patch("/change-password", {
        onRequest: [app.authenticateAdmin],
        schema: schemas.changePasswordSchema
    }, adminController.changePassword);
}