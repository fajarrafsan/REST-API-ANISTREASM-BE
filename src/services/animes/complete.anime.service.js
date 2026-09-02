import { logger } from "../../application/logging.js";
import { anilistRepository } from "../../repositories/anilistRepository.js";
import { mapCompleteAnime } from "../../mappers/animeMapper.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { describeError } from "../../utils/describeError.js";

export async function getAnimeComplete() {
    return getOrSetCache("complete-anime-home", 3600, async () => {
        try {
            const animeList = await samehadakuRepository.getCompleteAnimeList();
            const limited = animeList.slice(0, 15);

            // ✅ Semua request AniList jalan bersamaan, tidak menunggu satu-satu
            const animeDetail = await Promise.all(
                limited.map(async (anime) => {
                    const cleanedAnimeId = anime.animeId.replace(/-sub-indo$/i, "");

                    const media = await anilistRepository
                        .getCompleteAnime(anime.title)
                        .catch((err) => {
                            logger.warn(`[getAnimeComplete] AniList failed for "${anime.title}"`, {
                                status: err.response?.status,
                                message: err.message
                            });
                            return null;
                        });

                    return mapCompleteAnime(
                        { ...anime, animeId: cleanedAnimeId },
                        media?.[0] ?? null
                    );
                })
            );

            return animeDetail;

        } catch (error) {
            logger.error("ERROR GET ANIME COMPLETE SERVICE", describeError(error));
            throw error;
        }
    });
}