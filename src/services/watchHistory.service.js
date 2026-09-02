import { watchHistoryRepository } from "../repositories/watchHistoryRepository.js";
import { logger } from "../application/logging.js";

export const watchHistoryService = {
    async save({ userId, animeId, episodeId, title, episodeTitle, poster, progressSeconds, durationSeconds }) {
        try {
            // ✅ Fix: Langsung gunakan upsert dari repository Prisma.
            // Prisma akan otomatis:
            // 1. Update waktu (watchedAt) jika episodeId & userId sudah ada.
            // 2. Create data baru jika episodeId & userId belum ada.
            return await watchHistoryRepository.upsert({
                userId,
                animeId,
                episodeId,
                title,
                episodeTitle: episodeTitle ?? null,
                poster: poster ?? null,
                progressSeconds: progressSeconds ?? 0,
                durationSeconds: durationSeconds ?? null
            });
        } catch (error) {
            // Gagal menyimpan history tidak boleh merusak proses menonton user (silent failure)
            logger.warn("[watchHistoryService] Gagal simpan history:", error);
        }
    },

    async getHistory(userId) {
        return watchHistoryRepository.getByUser(userId);
    },

    async getContinueWatching(userId) {
        const history = await watchHistoryRepository.getContinueWatching(userId);
        // Hanya yang belum selesai (progress < 95% durasi, atau tidak ada info durasi tapi progress > 0)
        return history.filter(item =>
            (item.durationSeconds && item.progressSeconds / item.durationSeconds < 0.95) ||
            (!item.durationSeconds && item.progressSeconds > 0)
        );
    },

    async deleteOne(id, userId) {
        return watchHistoryRepository.deleteOne(id, userId);
    },

    async deleteAll(userId) {
        return watchHistoryRepository.deleteAll(userId);
    }
};