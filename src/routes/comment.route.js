import express from "express";
import {
    getComments,
    getReplies,
    postComment,
    editComment,
    deleteComment,
    likeComment
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const commentRoute = express.Router();

// Semua endpoint komentar butuh login (halaman detail anime sudah protected di FE)
commentRoute.get("/api/comments", authMiddleware, getComments);
commentRoute.get("/api/comments/:id/replies", authMiddleware, getReplies);
commentRoute.post("/api/comments", authMiddleware, postComment);
commentRoute.patch("/api/comments/:id", authMiddleware, editComment);
commentRoute.delete("/api/comments/:id", authMiddleware, deleteComment);
commentRoute.post("/api/comments/:id/like", authMiddleware, likeComment);

export default commentRoute;
