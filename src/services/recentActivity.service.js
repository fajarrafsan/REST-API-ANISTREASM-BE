import { watchHistoryRepository } from "../repositories/watchHistoryRepository.js";
import { wishlistRepository } from "../repositories/wishlistRepository.js";

const LIMIT = 5;

export const recentActivityService = {
    async getRecentActivity(userId) {
        const [recentWatched, recentWishlist] = await Promise.all([
            watchHistoryRepository.getByUser(userId, LIMIT),
            wishlistRepository.getByUser(userId, LIMIT)
        ]);

        return { recentWatched, recentWishlist };
    }
};
