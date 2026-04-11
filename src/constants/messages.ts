// constants/messages.js
export const MESSAGES = {
    USER_FETCHED_SUCCESS: "Users fetched successfully",
    USER_CREATED_SUCCESS: "User created successfully",
    USER_UPDATED_SUCCESS: "User updated successfully",
    USER_DEACTIVATED_SUCCESS: "User deactivated successfully",
    USERS_DELETED_SUCCESS: "Users deleted successfully",
    USER_NOT_FOUND: "User not found",
    USERS_NOT_FOUND: "No users found matching the provided names",
    USER_ALREADY_EXISTS: "User already exists",
    VALIDATION_ALL_FIELDS_REQUIRED: "Name, email and userName are required",
    VALIDATION_INVALID_INPUT: "Invalid input",
    VALIDATION_DUPLICATE_FIELD: "Duplicate field value",

    // ADMIN
    ADMIN:{
        ADMIN_NOT_FOUND: "Admin not found",
        ADMIN_LOGIN_SUCCESS: "Admin logged in successfully",
        INVALID_CREDENTIALS: "Invalid credentials",
        ADMIN_LOGOUT_SUCCESS: "Admin logged out successfully",
        ADMIN_DELETED_SUCCESS: "Admin deleted successfully",
        ADMIN_UPDATED_SUCCESS: "Admin updated successfully",
    }
} as const;
