import { UserModels } from "./user.model.js";

interface FindOptions {
    sort?: any;
    skip?: number;
    limit?: number;
}

export const findUsers = (query: any, options: FindOptions) => {
    return UserModels.find(query)
        .select("name email userName status isActive -_id")
        .sort(options.sort)
        .skip(options.skip || 0)
        .limit(options.limit || 10)
        .lean();
};

export const countUsers = (query: any) => {
    return UserModels.countDocuments(query);
};