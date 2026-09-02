import { logger } from "../../application/logging.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { describeError } from "../../utils/describeError.js";

export async function getAnimeByGenre(genreId, page = 1) {
    // Cache key dinamis berdasarkan genreId dan nomor halaman
    const cacheKey = `genre-anime-${genreId}-page-${page}`;

    return getOrSetCache(cacheKey, 3600, async () => {
        try {
            // 1. Ambil data mentah dari repository berdasarkan genre dan halaman
            const result = await samehadakuRepository.getAnimeListByGenre(genreId, page);

            const animeList = result.animeList ?? [];
            const pagination = result.pagination ?? null;

            // 2. Pemetaan data Samehadaku agar sesuai struktur MovieCard Anda
            const mappedData = animeList.map(anime => {
                return {
                    animeId: anime.animeId?.replace(/-sub-indo$/i, "") ?? "", // Pembersihan akhiran sub-indo
                    title: anime.title,
                    poster: anime.poster,
                    type: anime.type,
                    score: anime.score,
                    status: anime.status,
                    // Map ulang genreList objek menjadi array string sederhana
                    genres: anime.genreList ? anime.genreList.map(g => g.title) : []
                };
            });

            return {
                data: mappedData,
                pagination: pagination
            };

        } catch (error) {
            logger.error(`ERROR GET ANIME BY GENRE SERVICE FOR ${genreId}`, describeError(error));
            throw error;
        }
    });
}