import { searchHistoryRepository } from "../repositories/searchHistoryRepository.js";
import { logger } from "../application/logging.js";

export const searchHistoryService = {

    async save({ userId, keyword, animeId, title, poster, type }) {
        try {
            return await searchHistoryRepository.upsert({
                userId,
                keyword,
                animeId,
                title,
                poster: poster ?? null,
                type: type ?? null
            });
        } catch (error) {
            // Tidak throw — history gagal tidak boleh ganggu user
            logger.warn("[searchHistoryService] Gagal simpan history:", error.message);
        }
    },

    async getHistory(userId) {
        return searchHistoryRepository.getByUser(userId);
    },

    async deleteOne(id, userId) {
        return searchHistoryRepository.deleteOne(id, userId);
    },

    async deleteAll(userId) {
        return searchHistoryRepository.deleteAll(userId);
    }
};