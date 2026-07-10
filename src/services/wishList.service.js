import { wishlistRepository } from "../repositories/wishlistRepository.js";

export const wishlistService = {

    async toggle(userId, { animeId, title, poster }) {
        const existing = await wishlistRepository.findOne(userId, animeId);

        if (existing) {
            await wishlistRepository.remove(userId, animeId);
            return { wishlisted: false, message: "Dihapus dari wishlist." };
        }

        await wishlistRepository.add(userId, { animeId, title, poster });
        return { wishlisted: true, message: "Ditambahkan ke wishlist." };
    },

    async getAll(userId) {
        return wishlistRepository.getByUser(userId);
    },

    async getAnimeIds(userId) {
        return wishlistRepository.getAnimeIdsByUser(userId);
    },

    async remove(userId, animeId) {
        return wishlistRepository.remove(userId, animeId);
    }
};