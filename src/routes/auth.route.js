import express from "express";
import userController from "../controllers/user.controller.js";
import googleController from "../controllers/google.controller.js";

export const authApi = express.Router();
authApi.post("/api/users/register", userController.userRegister);
authApi.post("/api/users/login", userController.userLogin);
authApi.post("/api/users/refresh", userController.refreshToken);
authApi.post("/api/google/login", googleController.googleLogin);
