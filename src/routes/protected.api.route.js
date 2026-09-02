import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import userController, { uploadProfileImages, getUserProfile } from "../controllers/user.controller.js";
import { changePassword } from "../controllers/resetPassword.controller.js";


const protectedApi = express.Router();
protectedApi.use(authMiddleware);
protectedApi.get('/api/user', userController.getUser);
protectedApi.post('/api/user/logout', userController.userLogout);
protectedApi.get('/api/user/profile', getUserProfile);
protectedApi.patch('/api/user/password', changePassword);

protectedApi.put(
    '/api/user/profile',
    uploadProfileImages,               
    userController.updateProfile
);

export { protectedApi };