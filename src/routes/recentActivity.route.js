import express from "express";
import { getRecentActivity } from "../controllers/recentActivity.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const recentActivityRoute = express.Router();

recentActivityRoute.get("/api/user/recent-activity", authMiddleware, getRecentActivity);

export default recentActivityRoute;
