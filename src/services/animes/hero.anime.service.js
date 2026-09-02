import { logger } from "../../application/logging.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { anilistRepository } from "../../repositories/anilistRepository.js";
import { findBestMatch } from "../../utils/matcher.js";
import { mapHomeAnime } from "../../mappers/animeMapper.js";
import { describeError } from "../../utils/describeError.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getHeroAnimeHome() {
    return getOrSetCache("hero-anime-home", 3600, async () => {
        try {
            console.info("INI MASUK DATA HERO");
            // 1. Ambil 3 anime dari Samehadaku
            const animeList = await samehadakuRepository.getHeroAnimeList(3);

            // 2. Ambil airing data dari Anilist untuk matching
            const airingData = await anilistRepository
                .getAiringSchedules(1, 100)
                .catch((error) => {
                    // AniList hanya memperkaya hasil. Kalau layanannya mati,
                    // sajikan data Samehadaku tanpa pengayaan daripada
                    // menjatuhkan seluruh endpoint. Harus [], bukan null:
                    // findBestMatch mengiterasi nilai ini.
                    logger.warn("[AniList] tidak tersedia, lanjut tanpa pengayaan:", describeError(error));
                    return [];
                });

            const matched = [];
            const unmatched = [];

            // 3. Match dengan airing schedules
            const animeDetail = animeList.map((anime) => {
                const match = findBestMatch(anime.title, airingData);

                if (match) {
                    matched.push({
                        samehadaku: anime.title,
                        anilist: match.media.title.romaji || match.media.title.english
                    });
                } else {
                    unmatched.push(anime.title);
                }

                return mapHomeAnime(anime, match);
            });

            logger.info(`[getHeroAnimeHome] ✅ Matched: ${matched.length}/${animeList.length}`);
            if (unmatched.length > 0) {
                logger.info(`[getHeroAnimeHome] ❌ Unmatched:`, unmatched);
            }

            // 4. Query banner & synonyms — SECARA SEQUENTIAL dengan delay
            // JANGAN pakai Promise.all + sleep, karena tidak efektif
            const heroAnime = [];
            for (const data of animeDetail) {
                await sleep(150); 

                const cleanTitle = data.title
                    .replace(/Episode|\d+/gi, "")
                    .trim();

                try {
                    
                    const media = await anilistRepository.getHeroAnime(cleanTitle);
                    heroAnime.push({
                        ...data,
                        banner:
                            media?.bannerImage ||
                            media?.coverImage?.extraLarge ||
                            data.poster ||
                            null,
                        synonyms:
                            media?.synonyms?.[0] ||
                            media?.title?.english ||
                            media?.title?.romaji ||
                            null
                    });
                } catch (err) {
                    logger.warn(
                        `[getHeroAnimeHome] Failed to fetch banner for "${data.title}": ${err.message}`
                    );
                    // Kalau gagal, fallback ke poster samehadaku
                    heroAnime.push({
                        ...data,
                        banner: data.poster || null,
                        synonyms: null
                    });
                }
            }

            return heroAnime;
        } catch (error) {
            logger.error("ERROR GET HERO ANIME SERVICE", describeError(error));
            throw error;
        }
    });
}




