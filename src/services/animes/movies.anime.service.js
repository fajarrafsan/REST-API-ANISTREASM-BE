import { logger } from "../../application/logging.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { describeError } from "../../utils/describeError.js";

export async function getAnimeMovies(page = 1) {
    const cacheKey = `movies-anime-page-${page}`;

    return getOrSetCache(cacheKey, 3600, async () => {
        try {
            // 1. Ambil data mentah dari Samehadaku Repository
            const result = await samehadakuRepository.getMoviesAnimeList(page);

            const animeList = result.animeList ?? [];
            const pagination = result.pagination ?? null;

            // 2. Pemetaan (Mapping) mandiri agar langsung pas dengan komponen MovieCard Anda
            const mappedData = animeList.map(anime => {
                return {
                    animeId: anime.animeId.replace(/-sub-indo$/i, ""), // Bersihkan ID sub-indo
                    title: anime.title,
                    poster: anime.poster,
                    type: anime.type,
                    score: anime.score,
                    status: anime.status,
                    // Mengubah genreList (kumpulan objek) menjadi array string sederhana untuk MovieCard
                    genres: anime.genreList ? anime.genreList.map(g => g.title) : []
                };
            });

            // 3. Kembalikan data film beserta info paginasi
            return {
                data: mappedData,
                pagination: pagination
            };

        } catch (error) {
            logger.error("ERROR GET ANIME MOVIES SERVICE", describeError(error));
            throw error;
        }
    });
}