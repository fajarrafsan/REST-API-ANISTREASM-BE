import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response.error.js";
import { generateRefreshToken, generateToken } from "../utils/generate.token.js";
import { getUserValidation, loginValidation, registerValidation, updateProfileValidation } from "../validation/user.validation.js";
import { validate } from "../validation/validation.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { logger } from "../application/logging.js";
import redisClient from "../application/redisClient.js";
import { uploadImage } from "./storage.service.js";

async function register(request) {
    request = validate(registerValidation, request);

    const emailInDatabase = await prismaClient.user.count({
        where: {
            email: request.email
        }
    });

    if (emailInDatabase === 1) {
        throw new ResponseError(404, "Email already exists");
    }

    const hashedPassword = await argon2.hash(request.password);
    request.password = hashedPassword;

    return prismaClient.user.create({
        data: {
            username: request.username,
            email: request.email,
            password: request.password
        },
        select: {
            username: true,
            email: true
        }
    });
}

async function login(request) {
    request = validate(loginValidation, request);

    // 1. Ambil data user sekaligus sertakan (include) data profilnya
    const user = await prismaClient.user.findUnique({
        where: {
            email: request.email
        },
        include: {
            profil: true // Tambahkan ini agar data profil ikut terbawa
        }
    });

    if (!user) {
        throw new ResponseError(404, "User not found");
    }

    if (user.provider === "GOOGLE") {
        throw new ResponseError(400, "Akun ini terdaftar dengan Google. Silakan login menggunakan Google.");
    }

    const verifyPassword = await argon2.verify(user.password, request.password);
    if (!verifyPassword) {
        throw new ResponseError(401, "User or Password wrong!");
    }

    const accessToken = await generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    // 2. Berikan fallback jika seandainya data profil di database masih bernilai null
    const profilData = user.profil || {
        bio: null,
        avatar: null,
        cover: null
    };

    // 3. Kembalikan data dengan struktur yang konsisten (seperti fungsi get/google login)
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            provider: user.provider,
            profil: {
                bio: profilData.bio,
                avatar: profilData.avatar,
                cover: profilData.cover
            }
        },
        accessToken,
        refreshToken
    };
}

async function get(userId) {
    userId = validate(getUserValidation, userId);
    console.info("MASUK GET");

    const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            provider: true,
            // ✅ Include profil sekalian
            profil: {
                select: {
                    bio: true,
                    avatar: true,
                    cover: true
                }
            }
        }
    });

    if (!user) {
        throw new ResponseError(404, "User not found");
    }

    return user;
}

async function update(userId, request) {
    const { avatarFile, coverFile, ...textRequest } = request;

    const validatedText = validate(updateProfileValidation, textRequest);

    const userInDatabase = await prismaClient.user.count({
        where: { id: userId }
    });

    if (userInDatabase !== 1) {
        throw new ResponseError(404, "User not found");
    }

    // Upload ke Cloudinary kalau ada file baru
    // public_id pakai userId → overwrite otomatis, tidak perlu hapus dulu
    let newAvatarUrl = undefined;
    let newCoverUrl = undefined;

    if (avatarFile) {
        newAvatarUrl = await uploadImage(avatarFile.buffer, "avatars", userId);
    }

    if (coverFile) {
        newCoverUrl = await uploadImage(coverFile.buffer, "covers", userId);
    }

    // Hanya update field yang benar-benar berubah
    const updateData = { bio: validatedText.bio };
    if (newAvatarUrl !== undefined) updateData.avatar = newAvatarUrl;
    if (newCoverUrl !== undefined) updateData.cover = newCoverUrl;

    return prismaClient.profil.upsert({
        where: { userId },
        update: updateData,
        create: {
            userId,
            bio: validatedText.bio || "Binge-watcher by night, dreamer by day.",
            avatar: newAvatarUrl ?? null,
            cover: newCoverUrl ?? null
        },
        select: {
            bio: true,
            avatar: true,
            cover: true,
            user: {
                select: {
                    username: true,
                    email: true
                }
            }
        }
    });
}

export { update };
async function refresh(refresh) {
    if (!refresh) {
        throw new ResponseError(401, "Refresh token not found");
    }

    try {

        const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);

        if (redisClient.status === "ready") {
            const session = await redisClient.get(
                `session:${decoded.id}:refresh`
            );

            if (!session) {
                throw new ResponseError(401, "Refresh token expired or revoked");
            }
            if (session !== refresh) {
                throw new ResponseError(401, "Invalid refresh token");
            }
        }

        const user = await prismaClient.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            throw new ResponseError(404, "User not found");
        }

        const accessToken = await generateToken(user);

        return { accessToken };
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }

        logger.error("Refresh token error:", error);
        throw new ResponseError(401, "Invalid refresh token");
    }
}

async function logout(userId) {
    try {
        if (redisClient.status === "ready") {
            await redisClient.del(`session:${userId}:refresh`);
            await redisClient.del(`session:${userId}:access`);
        }
    } catch (error) {
        logger.error("Logout redis error:", error);
    }
}

async function getProfile(userId) {
    const userInDatabase = await prismaClient.user.count({
        where: {
            id: userId
        }
    });

    if (userInDatabase !== 1) {
        throw new ResponseError(404, "User not found");
    }

    const profile = await prismaClient.profil.findUnique({
        where: {
            userId: userId
        },
        select: {
            bio: true,
            avatar: true,
            cover: true,
            user: {
                select: {
                    username: true,
                    email: true
                }
            }
        }
    });

    return profile;
}


export default { register, login, get, refresh, logout, update, getProfile };