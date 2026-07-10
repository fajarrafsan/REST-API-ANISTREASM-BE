import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path"; // 1. Tambahkan import path
import { errorMiddleware } from "../middlewares/error.middleware.js";
import { authApi } from "../routes/auth.route.js";
import { animeRoute } from "../routes/anime.route.js";
import { protectedApi } from "../routes/protected.api.route.js";
import searchHistoryRoute from "../routes/SearchHistory.route.js";
import wishlistRoute from "../routes/wishList.route.js";
import watchHistoryRoute from "../routes/watchHistory.route.js";
import recentActivityRoute from "../routes/recentActivity.route.js";
import commentRoute from "../routes/comment.route.js";

const web = express();

web.use(cookieParser());

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,https://anistreasm-fe-nine.vercel.app").split(",");

web.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

web.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});


web.use(express.json());

web.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

web.use(wishlistRoute);
web.use(watchHistoryRoute);
web.use(recentActivityRoute);
web.use(commentRoute);
web.use(animeRoute);
web.use(searchHistoryRoute);
web.use(authApi);
web.use(protectedApi);
web.use(errorMiddleware);

export { web };