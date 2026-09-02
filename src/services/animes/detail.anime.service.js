import { logger } from "../../application/logging.js";
import { mapAnimeDetail } from "../../mappers/animeMapper.js";
import { anilistRepository } from "../../repositories/anilistRepository.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { withTimeout } from "../../utils/withTimeout.js";
import { describeError } from "../../utils/describeError.js";

export async function getAnimeDetailBySlug(slug) {
    return getOrSetCache(
        `anime-detail:${slug}`,
        3600,
        async () => {
            try {
                logger.info(`[getAnimeDetailBySlug] Fetching ${slug}`);

                const anime = await samehadakuRepository.getAnimeDetailBySlug(slug);
                anime.animeId = slug;

                const ANILIST_TIMEOUT = parseInt(process.env.ANILIST_TIMEOUT) || 3000;

                const [japaneseResult, slugResult, englishResult] = await Promise.allSettled([
                    withTimeout(
                        anilistRepository.getAnimeBySearch(anime.japanese),
                        ANILIST_TIMEOUT,
                        "AniList Japanese"
                    ).catch(err => {
                        logger.warn(`[getAnimeDetailBySlug] Japanese search timeout/failed: ${err.message}`);
                        return null;
                    }),

                    withTimeout(
                        anilistRepository.getAnimeBySearch(slug),
                        ANILIST_TIMEOUT,
                        "AniList Slug"
                    ).catch(err => {
                        logger.warn(`[getAnimeDetailBySlug] Slug search timeout/failed: ${err.message}`);
                        return null;
                    }),

                    anime.english
                        ? withTimeout(
                            anilistRepository.getAnimeBySearch(anime.english),
                            ANILIST_TIMEOUT,
                            "AniList English"
                        ).catch(err => {
                            logger.warn(`[getAnimeDetailBySlug] English search timeout/failed: ${err.message}`);
                            return null;
                        })
                        : Promise.resolve(null)
                ]);

                // Ambil hasil pertama yang berhasil
                let anilistData = null;

                if (japaneseResult.status === 'fulfilled' && japaneseResult.value) {
                    anilistData = japaneseResult.value;
                    logger.info(`[getAnimeDetailBySlug] AniList found via japanese title`);
                } else if (slugResult.status === 'fulfilled' && slugResult.value) {
                    anilistData = slugResult.value;
                    logger.info(`[getAnimeDetailBySlug] AniList found via slug`);
                } else if (englishResult.status === 'fulfilled' && englishResult.value) {
                    anilistData = englishResult.value;
                    logger.info(`[getAnimeDetailBySlug] AniList found via english title`);
                }

                if (!anilistData) {
                    logger.warn(`[getAnimeDetailBySlug] All AniList searches failed for "${slug}"`);
                }

                return mapAnimeDetail(anime, anilistData);

            } catch (error) {
                logger.error(`[getAnimeDetailBySlug] Error ${slug}`, describeError(error));
                throw error;
            }
        }
    );
}