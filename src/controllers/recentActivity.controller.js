import { recentActivityService } from "../services/recentActivity.service.js";

export async function getRecentActivity(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await recentActivityService.getRecentActivity(userId);
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}
