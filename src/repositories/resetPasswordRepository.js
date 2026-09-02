import { prismaClient } from "../application/database.js";

export const resetPasswordRepository = {

    async create({ token, userId, expiresAt }) {
        return prismaClient.resetPasswordToken.create({
            data: { token, userId, expiresAt }
        });
    },

    async findValid(token) {
        const now = new Date();
        return prismaClient.resetPasswordToken.findFirst({
            where: {
                token,
                usedAt: null,
                expiresAt: { gt: now }
            }
        });
    },

    async markUsed(id) {
        return prismaClient.resetPasswordToken.update({
            where: { id },
            data: { usedAt: new Date() }
        });
    },

    // Hapus token lama yang sudah kedaluwarsa / terpakai untuk user
    async deleteExpiredForUser(userId) {
        const now = new Date();
        return prismaClient.resetPasswordToken.deleteMany({
            where: {
                userId,
                OR: [
                    { expiresAt: { lt: now } },
                    { usedAt: { not: null } }
                ]
            }
        });
    }
};
