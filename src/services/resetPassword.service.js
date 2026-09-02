import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response.error.js";
import { sendMail, mailEnabled } from "../config/mailer.js";
import { resetPasswordRepository } from "../repositories/resetPasswordRepository.js";
import { validate } from "../validation/validation.js";
import { resetPasswordRequestValidation, resetPasswordConfirmValidation, emailValidation } from "../validation/user.validation.js";
import { logger } from "../application/logging.js";
import argon2 from "argon2";
import crypto from "crypto";

const EXPIRES_MIN = Number(process.env.RESET_TOKEN_EXPIRES_MIN) || 30;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 1. User minta reset password via email
export async function requestResetPassword(request) {
    request = validate(emailValidation, request);

    if (!mailEnabled()) {
        throw new ResponseError(503, "Layanan email belum dikonfigurasi. Hubungi admin.");
    }

    const user = await prismaClient.user.findUnique({
        where: { email: request.email }
    });

    // Jangan bocorkan apakah email terdaftar — selalu balas sukses
    if (!user) {
        return { message: "Jika email terdaftar, tautan reset akan dikirim." };
    }

    // Token acak yang aman
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + EXPIRES_MIN * 60 * 1000);

    // Bersihkan token lama user agar tidak menumpuk
    await resetPasswordRepository.deleteExpiredForUser(user.id);

    await resetPasswordRepository.create({ token, userId: user.id, expiresAt });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    try {
        await sendMail({
            to: user.email,
            subject: "Reset Password - AniStream",
            html: `
                <p>Halo ${user.username},</p>
                <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
                <p>Klik tautan berikut untuk membuat password baru (berlaku ${EXPIRES_MIN} menit):</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
            `
        });
    } catch (error) {
        logger.error("[requestResetPassword] Gagal kirim email:", error);
        throw new ResponseError(500, "Gagal mengirim email reset password.");
    }

    return { message: "Jika email terdaftar, tautan reset akan dikirim." };
}

// 2. User submit password baru dengan token
export async function confirmResetPassword(request) {
    request = validate(resetPasswordConfirmValidation, request);

    const record = await resetPasswordRepository.findValid(request.token);

    if (!record) {
        throw new ResponseError(400, "Token reset tidak valid atau sudah kedaluwarsa.");
    }

    const hashedPassword = await argon2.hash(request.password);

    await prismaClient.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword }
    });

    await resetPasswordRepository.markUsed(record.id);

    // Cabut semua sesi lama user
    try {
        const { default: redisClient } = await import("../application/redisClient.js");
        if (redisClient.status === "ready") {
            await redisClient.del(`session:${record.userId}:refresh`);
            await redisClient.del(`session:${record.userId}:access`);
        }
    } catch (error) {
        logger.warn("[confirmResetPassword] Gagal hapus sesi Redis:", error.message);
    }

    return { message: "Password berhasil direset. Silakan login dengan password baru." };
}

export async function changePassword(userId, request) {
    const { currentPassword, newPassword } = request;

    if (!currentPassword || !newPassword) {
        throw new ResponseError(400, "currentPassword dan newPassword wajib diisi.");
    }

    const user = await prismaClient.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ResponseError(404, "User not found");
    }

    if (!user.password) {
        throw new ResponseError(400, "Akun ini menggunakan Google, tidak memiliki password.");
    }

    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) {
        throw new ResponseError(401, "Password lama salah.");
    }

    const hashed = await argon2.hash(newPassword);
    await prismaClient.user.update({
        where: { id: userId },
        data: { password: hashed }
    });

    return { message: "Password berhasil diubah." };
}

export default { requestResetPassword, confirmResetPassword, changePassword };
