// src/routes/searchHistoryRoute.js
import express from "express";
import { saveHistory, getHistory, deleteHistory } from "../controllers/searchHistory.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const searchHistoryRoute = express.Router();

searchHistoryRoute.post("/api/search-history", authMiddleware, saveHistory);
searchHistoryRoute.get("/api/search-history", authMiddleware, getHistory);
searchHistoryRoute.delete("/api/search-history/:id", authMiddleware, deleteHistory); // id atau "all"

export default searchHistoryRoute;