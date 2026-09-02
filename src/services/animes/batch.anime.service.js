import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function getBatchList(page = 1) {
    return getOrSetCache(
        `batch-list:page-${page}`,
        3600,
        async () => {
            try {
                logger.info(`[getBatchList] Fetching page ${page}`);

                const { batchList, pagination } = await samehadakuRepository.getBatchList(page);

                return {
                    data: batchList.map(batch => ({
                        title:    batch.title,
                        poster:   batch.poster,
                        type:     batch.type,
                        score:    batch.score,
                        status:   batch.status,
                        batchId:  batch.batchId,
                        genres:   batch.genreList?.map(g => g.title) ?? []
                    })),
                    pagination: {
                        currentPage:  pagination.currentPage,
                        totalPages:   pagination.totalPages,
                        hasNextPage:  pagination.hasNextPage,
                        hasPrevPage:  pagination.hasPrevPage,
                        nextPage:     pagination.nextPage,
                        prevPage:     pagination.prevPage
                    }
                };

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getBatchList] Upstream error", {
                        status: error.response?.status,
                        data:   error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}

export async function getBatchDetail(batchId) {
    return getOrSetCache(
        `batch-detail:${batchId}`,
        3600,
        async () => {
            try {
                logger.info(`[getBatchDetail] Fetching batch: ${batchId}`);

                const data = await samehadakuRepository.getBatchDetail(batchId);

                return {
                    title:       data.title,
                    animeId:     data.animeId,
                    poster:      data.poster,
                    japanese:    data.japanese ?? "",
                    synonyms:    data.synonyms ?? "",
                    english:     data.english ?? "",
                    status:      data.status,
                    type:        data.type,
                    source:      data.source ?? "",
                    score:       data.score,
                    duration:    data.duration ?? "",
                    episodes:    data.episodes ?? null,
                    season:      data.season ?? "",
                    studios:     data.studios ?? "",
                    producers:   data.producers ?? "",
                    aired:       data.aired ?? "",
                    releasedOn:  data.releasedOn ?? "",
                    synopsis: {
                        paragraphs:  data.synopsis?.paragraphs ?? [],
                        connections: data.synopsis?.connections ?? []
                    },
                    genres:      data.genreList?.map(g => g.title) ?? [],
                    downloadUrl: data.downloadUrl?.formats?.map(format => ({
                        title:    format.title,
                        qualities: format.qualities?.map(quality => ({
                            title: quality.title?.trim(),
                            urls: quality.urls?.map(urlItem => ({
                                title: urlItem.title,
                                url:   urlItem.url
                            })) ?? []
                        })) ?? []
                    })) ?? [],
                    recommendedAnimeList: data.recommendedAnimeList?.map(anime => ({
                        title:   anime.title,
                        poster:  anime.poster,
                        animeId: anime.animeId
                    })) ?? []
                };

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getBatchDetail] Upstream error", {
                        status: error.response?.status,
                        data:   error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}
