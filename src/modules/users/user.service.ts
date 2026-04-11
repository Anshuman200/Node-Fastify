import * as repo from "./user.repository.js";

interface GetUsersParams {
    query: any;
    skip: number;
    limit: number;
}

export const getUsersService = async ({ query, skip, limit }: GetUsersParams) => {
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