import express from "express";
import userController from "../controllers/user.controller.js";
import googleController from "../controllers/google.controller.js";
import { forgotPassword, resetPassword } from "../controllers/resetPassword.controller.js";

export const authApi = express.Router();
authApi.post("/api/users/register", userController.userRegister);
authApi.post("/api/users/login", userController.userLogin);
authApi.post("/api/users/refresh", userController.refreshToken);
authApi.post("/api/google/login", googleController.googleLogin);
authApi.post("/api/users/forgot-password", forgotPassword);
authApi.post("/api/users/reset-password", resetPassword);
