import * as repo from "./user.repository.js";

export const getUsersService = async ({ query, skip, limit }) => {
    const [users, total] = await Promise.all([
        repo.findUsers(query, {
            sort: { createdAt: -1 },
            skip,
            limit
        }),
        repo.countUsers(query)
    ]);

    return { users, total };
};