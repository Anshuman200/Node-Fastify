// repositories/userRepository.js
import { UserModels } from "./user.model.js";

export const findUsers = (query, options) => {
    return UserModels.find(query)
        .select("name email userName status isActive -_id")
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .lean();
};

export const countUsers = (query) => {
    return UserModels.countDocuments(query);
};