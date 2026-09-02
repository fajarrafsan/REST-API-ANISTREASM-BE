import { ratingRepository } from "../repositories/ratingRepository.js";
import { validate } from "../validation/validation.js";
import { ratingValidation } from "../validation/rating.validation.js";

export const ratingService = {

    // BERI ATAU UPDATE rating (1-10). score 0 menghapus rating.
    async rate(userId, { animeId, score }) {
        animeId = validate(ratingValidation.animeId, animeId);
        score = validate(ratingValidation.score, score);

        if (score === 0) {
            await ratingRepository.remove(userId, animeId);
            return { animeId, score: null, message: "Rating dihapus." };
        }

        await ratingRepository.upsert(userId, { animeId, score });
        return { animeId, score, message: "Rating berhasil disimpan." };
    },

    // Ambil rating user + aggregate untuk sebuah anime
    async getForAnime(userId, animeId) {
        animeId = validate(ratingValidation.animeId, animeId);

        const [userRating, aggregate] = await Promise.all([
            ratingRepository.findByUser(userId, animeId),
            ratingRepository.getAggregate(animeId)
        ]);

        return {
            ...aggregate,
            userScore: userRating?.score ?? null
        };
    },

    // Ambil semua rating user (untuk bulk check di detail list)
    async getByUser(userId) {
        return ratingRepository.getByUser(userId);
    },

    // Statistik agregat untuk anime tertentu (tanpa user)
    async getAggregate(animeId) {
        animeId = validate(ratingValidation.animeId, animeId);
        return ratingRepository.getAggregate(animeId);
    }
};
