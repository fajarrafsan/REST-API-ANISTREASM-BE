import { searchHistoryService } from "../services/searchHistory.service.js";

// POST /api/search-history
export async function saveHistory(req, res) {
    const userId = req.user.id; // dari auth middleware
    const { keyword, animeId, title, poster, type } = req.body;

    if (!animeId || !title || !keyword) {
        return res.status(400).json({ message: "animeId, title, dan keyword wajib diisi." });
    }

    await searchHistoryService.save({ userId, keyword, animeId, title, poster, type });

    return res.status(201).json({ message: "History berhasil disimpan." });
}

// GET /api/search-history
export async function getHistory(req, res) {
    const userId = req.user.id;
    const history = await searchHistoryService.getHistory(userId);
    return res.json({ data: history });
}

// DELETE /api/search-history/:id
// DELETE /api/search-history/all
export async function deleteHistory(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === "all") {
        await searchHistoryService.deleteAll(userId);
    } else {
        await searchHistoryService.deleteOne(Number(id), userId);
    }

    return res.json({ message: "History berhasil dihapus." });
}