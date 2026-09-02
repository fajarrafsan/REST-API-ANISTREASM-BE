import { ratingService } from "../services/rating.service.js";

export async function rateAnimeHandler(req, res, next) {
    try {
        const userId = req.user.id;
        const { animeId, score } = req.body;

        if (!animeId?.trim()) {
            return res.status(400).json({
                success: false,
                errors: "animeId is required"
            });
        }

        const result = await ratingService.rate(userId, { animeId, score });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function getAnimeRatingHandler(req, res, next) {
    try {
        const userId = req.user.id;
        const { animeId } = req.params;

        if (!animeId?.trim()) {
            return res.status(400).json({
                success: false,
                errors: "animeId is required"
            });
        }

        const result = await ratingService.getForAnime(userId, animeId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function getUserRatingsHandler(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await ratingService.getByUser(userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}
