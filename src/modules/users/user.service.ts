import { userRepository } from "./user.repository.js";

interface GetUsersParams {
    query: any;
    skip: number;
    limit: number;
}

export const getUsersService = async ({ query, skip, limit }: GetUsersParams) => {
    const [users, total] = await Promise.all([
        userRepository.findUsers(query, {
            sort: { createdAt: -1 },
            skip,
            limit
        }),
        userRepository.countUsers(query)
    ]);

    return { users, total };
};