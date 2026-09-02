import express from "express";
import {
    saveWatchHistory,
    getWatchHistory,
    getContinueWatching,
    deleteWatchHistory
} from "../controllers/watchHistory.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const watchHistoryRoute = express.Router();

watchHistoryRoute.post("/api/anime/watch-history", authMiddleware, saveWatchHistory);
watchHistoryRoute.get("/api/anime/watch-history", authMiddleware, getWatchHistory);
watchHistoryRoute.get("/api/anime/watch-history/continue", authMiddleware, getContinueWatching);
watchHistoryRoute.delete("/api/anime/watch-history/:id", authMiddleware, deleteWatchHistory); // id atau "all"

export default watchHistoryRoute;
