import { wishlistService } from "../services/wishList.service.js";

// POST /api/wishlist/toggle
export async function toggleWishlist(req, res) {
    const userId = req.user.id;
    const { animeId, title, poster } = req.body;

    if (!animeId || !title) {
        return res.status(400).json({ message: "animeId dan title wajib diisi." });
    }

    const result = await wishlistService.toggle(userId, { animeId, title, poster });
    return res.json(result);
}

// GET /api/wishlist
export async function getWishlist(req, res) {
    const userId = req.user.id;
    const data = await wishlistService.getAll(userId);
    return res.json({ data });
}

// GET /api/wishlist/ids
// Untuk cek bulk di FE — tau mana anime yang sudah di-wishlist
export async function getWishlistIds(req, res) {
    const userId = req.user.id;
    const data = await wishlistService.getAnimeIds(userId);
    return res.json({ data });
}

// DELETE /api/wishlist/:animeId
export async function removeWishlist(req, res) {
    const userId = req.user.id;
    const { animeId } = req.params;
    await wishlistService.remove(userId, animeId);
    return res.json({ message: "Dihapus dari wishlist." });
}