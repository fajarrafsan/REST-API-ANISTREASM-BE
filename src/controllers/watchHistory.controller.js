import { watchHistoryService } from "../services/watchHistory.service.js";

// POST /api/anime/watch-history
export async function saveWatchHistory(req, res) {
    const userId = req.user.id; // dari auth middleware
    const { animeId, episodeId, title, episodeTitle, poster, progressSeconds, durationSeconds } = req.body;

    if (!animeId || !episodeId || !title) {
        return res.status(400).json({ message: "animeId, episodeId, dan title wajib diisi." });
    }

    await watchHistoryService.save({ userId, animeId, episodeId, title, episodeTitle, poster, progressSeconds, durationSeconds });

    return res.status(201).json({ message: "Watch history berhasil disimpan." });
}

// GET /api/anime/watch-history
export async function getWatchHistory(req, res) {
    const userId = req.user.id;
    const history = await watchHistoryService.getHistory(userId);
    return res.json({ data: history });
}

// GET /api/anime/watch-history/continue
export async function getContinueWatching(req, res) {
    const userId = req.user.id;
    const history = await watchHistoryService.getContinueWatching(userId);
    return res.json({ data: history });
}

// DELETE /api/anime/watch-history/:id (atau :id = 'all')
export async function deleteWatchHistory(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === "all") {
        await watchHistoryService.deleteAll(userId);
    } else {
        await watchHistoryService.deleteOne(Number(id), userId);
    }

    return res.json({ message: "Watch history berhasil dihapus." });
}
