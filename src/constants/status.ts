export const ACCOUNT_STATUS = {
    ACTIVE: "active",
    DEACTIVATE: "deactivate",
    DELETE: "delete",
    PENDING: "pending"
} as const;

export const USER_TYPES = {
    ADMIN: "admin",
    SUB_ADMIN: "sub-admin",
    USER: "user",
    GUEST: "guest"
} as const;
