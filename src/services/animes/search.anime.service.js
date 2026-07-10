import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function searchAnime(keyword) {
    return getOrSetCache(
        `anime-search:${keyword.toLowerCase().trim()}`,
        3600,
        async () => {
            try {
                // logger.info(`[searchAnime] Searching anime: ${keyword}`);
                console.log("MASUK LAGI SEARCH : ", keyword);

                const result = await samehadakuRepository.searchAnime(keyword);

                return result;
            } catch (error) {
                logger.error(`[searchAnime] Error searching anime: ${keyword}`, {
                    status: error.response?.status,
                    message: error.response?.data?.message ?? error.message
                });

                throw error;
            }
        }
    );
}