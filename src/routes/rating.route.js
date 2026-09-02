import express from "express";
import {
    rateAnimeHandler,
    getAnimeRatingHandler,
    getUserRatingsHandler
} from "../controllers/rating.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const ratingRoute = express.Router();

ratingRoute.post("/api/anime/rating", authMiddleware, rateAnimeHandler);
ratingRoute.get("/api/anime/rating/:animeId", authMiddleware, getAnimeRatingHandler);
ratingRoute.get("/api/anime/ratings", authMiddleware, getUserRatingsHandler);

export default ratingRoute;
