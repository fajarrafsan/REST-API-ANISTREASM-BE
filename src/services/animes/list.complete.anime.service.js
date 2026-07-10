import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function getListComplete(page = 1, order = 'latest') {
    return getOrSetCache(
        `anime-list:page-${page}:order-${order}`,
        3600,
        async () => {
            try {
                logger.info(`[getAnimeList] Fetching page ${page} order ${order}`);

                const { animeList, pagination } = await samehadakuRepository.getAnimeListComplete(page, order);

                return {
                    data: animeList.map(anime => ({
                        title:   anime.title,
                        poster:  anime.poster,
                        type:    anime.type,
                        score:   anime.score,
                        status:  anime.status,
                        animeId: anime.animeId,
                        genres:  anime.genreList?.map(g => g.title) ?? []
                    })),
                    pagination: {
                        currentPage: pagination.currentPage,
                        totalPages:  pagination.totalPages,
                        hasNextPage: pagination.hasNextPage,
                        hasPrevPage: pagination.hasPrevPage,
                        nextPage:    pagination.nextPage,
                        prevPage:    pagination.prevPage
                    }
                };

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getAnimeList] Upstream error", {
                        status: error.response?.status,
                        errors:   error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}