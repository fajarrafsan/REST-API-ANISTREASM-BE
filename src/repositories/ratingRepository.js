import { prismaClient } from "../application/database.js";

export const ratingRepository = {

    async findOne(userId, animeId) {
        return prismaClient.animeRating.findUnique({
            where: { userId_animeId: { userId, animeId } }
        });
    },

    // Simpan / update rating user untuk sebuah anime
    async upsert(userId, { animeId, score }) {
        return prismaClient.animeRating.upsert({
            where: { userId_animeId: { userId, animeId } },
            update: { score },
            create: { userId, animeId, score }
        });
    },

    // Hapus rating yang sudah ada
    async remove(userId, animeId) {
        return prismaClient.animeRating.deleteMany({
            where: { userId, animeId }
        });
    },

    // Ambil rating milik user untuk anime tertentu (untuk cek di detail)
    async findByUser(userId, animeId) {
        return prismaClient.animeRating.findUnique({
            where: { userId_animeId: { userId, animeId } },
            select: { score: true }
        });
    },

    // Ambil semua rating user (bulk check animeIds)
    async getByUser(userId) {
        const rows = await prismaClient.animeRating.findMany({
            where: { userId },
            select: { animeId: true, score: true }
        });
        return rows;
    },

    // Statistik agregat untuk sebuah anime
    async getAggregate(animeId) {
        const aggregate = await prismaClient.animeRating.aggregate({
            where: { animeId },
            _avg: { score: true },
            _count: { score: true }
        });

        return {
            animeId,
            averageScore: aggregate._avg.score
                ? Number(aggregate._avg.score.toFixed(1))
                : null,
            count: aggregate._count.score
        };
    }
};
