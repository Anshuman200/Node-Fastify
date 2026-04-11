const toTrimAndLower = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.trim().toLowerCase();
}

const toTrim = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.trim();
}

const toLowerCase = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.toLowerCase();
}

const toUpperCase = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.toUpperCase();
}

const toTrimAndUpper = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.trim().toUpperCase();
}

const toTrimAndNumber = (str: string | undefined | null): string | number => {
    if (!str) return 0;
    return str.trim().replace(/\D/g, "");
}

/**
 * ==================== HOW TO USE =======================
 * 1. Use defaults (cleans password, otp, timestamps, etc.)
 * const response = formatEntityResponse(user);
 * 
 * 2. Custom exclusions only
 * const response = formatEntityResponse(user, ["email", "status"]);
 * 
 * 3. Keep everything except password
 * const response = formatEntityResponse(user, ["password"]);

*/
const formatEntityResponse = (entity: any, excludeFields: string[] = ["password", "otp", "otpExpires", "createdAt", "updatedAt", "_id", "id", "__v"]) => {
    if (!entity) return null;
    const response = typeof entity.toObject === "function" ? entity.toObject() : { ...entity };
    excludeFields.forEach(field => delete response[field]);
    return response;
}

export {
    toTrimAndLower,
    toTrim,
    toLowerCase,
    toUpperCase,
    toTrimAndUpper,
    toTrimAndNumber,
    formatEntityResponse
}