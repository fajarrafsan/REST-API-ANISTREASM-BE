// src/routes/wishlistRoute.js
import express from "express";
import {
    toggleWishlist,
    getWishlist,
    getWishlistIds,
    removeWishlist
} from "../controllers/wishList.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const wishlistRoute = express.Router();

wishlistRoute.post("/api/anime/wishlist/toggle", authMiddleware, toggleWishlist);
wishlistRoute.get("/api/anime/wishlist", authMiddleware, getWishlist);
wishlistRoute.get("/api/anime/wishlist/ids", authMiddleware, getWishlistIds);
wishlistRoute.delete("/api/anime/wishlist/:animeId", authMiddleware, removeWishlist);

export default wishlistRoute;