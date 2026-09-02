import { logger } from "../../application/logging.js";
import { mapHomeAnime } from "../../mappers/animeMapper.js";
import { anilistRepository } from "../../repositories/anilistRepository.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { findBestMatch } from "../../utils/matcher.js";
import { describeError } from "../../utils/describeError.js";

export async function getHomeAnime() {
    return getOrSetCache("anime-home", 3600, async () => {
        try {
            console.info("INI MASUK DATA HOME");
            const animeList = await samehadakuRepository.getHomeAnimeList();

            const limitedAnimeList = animeList.slice(0, 15);

            // Ambil 100 data untuk meningkatkan chance match
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


            // AniList kosong berarti layanannya gagal. Ambil daftar ongoing
            // Samehadaku sebagai sumber pengganti untuk poster, skor, status
            // dan genre — provider yang sama, jadi tidak menambah dependensi.
            let fallbackById = new Map();
            if (airingData.length === 0) {
                const ongoing = await samehadakuRepository
                    .getOngoingAnimeList(1, "popular")
                    .catch((error) => {
                        logger.warn("[Fallback] Daftar ongoing gagal diambil:", describeError(error));
                        return { animeList: [] };
                    });
                fallbackById = new Map(
                    (ongoing.animeList ?? []).map((item) => [item.animeId, item])
                );
                logger.info(`[Fallback] ${fallbackById.size} anime ongoing tersedia sebagai pengganti AniList.`);
            }
            const matched = [];
            const unmatched = [];

            // Lakukan perulangan hanya pada 15 item yang sudah dibatasi
            const animeDetail = limitedAnimeList.map((anime) => {
                const match = findBestMatch(anime.title, airingData);

                if (match) {
                    matched.push({
                        samehadaku: anime.title,
                        anilist: match.media.title.romaji || match.media.title.english
                    });
                } else {
                    unmatched.push(anime.title);
                }

                return mapHomeAnime(anime, match, fallbackById.get(anime.animeId) ?? null);
            });

            // Debug log disesuaikan dengan limitedAnimeList
            logger.info(`[getHomeAnime] Matched: ${matched.length}/${limitedAnimeList.length}`);
            if (unmatched.length > 0) {
                logger.info("[getHomeAnime] Unmatched:", unmatched);
            }

            return animeDetail;
        } catch (error) {
            logger.error("ERROR GET HOME ANIME SERVICE", describeError(error));
            throw error;
        }
    });
}