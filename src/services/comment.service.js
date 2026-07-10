import { commentRepository } from "../repositories/commentRepository.js";
import { ResponseError } from "../error/response.error.js";

const MAX_LENGTH = 1000;
const DEFAULT_LIMIT = 10;

function sanitizeContent(content) {
    if (typeof content !== "string" || content.trim().length === 0) {
        throw new ResponseError(400, "Isi komentar tidak boleh kosong.");
    }
    const trimmed = content.trim();
    if (trimmed.length > MAX_LENGTH) {
        throw new ResponseError(400, `Komentar maksimal ${MAX_LENGTH} karakter.`);
    }
    return trimmed;
}

export const commentService = {

    // List komentar utama sebuah anime + total + commentId yang sudah di-like user
    async list(userId, animeId, { sort = "newest", page = 1, limit = DEFAULT_LIMIT } = {}) {
        if (!animeId) {
            throw new ResponseError(400, "animeId wajib diisi.");
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const take = Math.max(1, Math.min(50, Number(limit) || DEFAULT_LIMIT));
        const skip = (currentPage - 1) * take;

        const [rawComments, total, likedIds] = await Promise.all([
            commentRepository.getByAnime(animeId, { sort, skip, take, extraForHasMore: true }),
            commentRepository.countByAnime(animeId),
            commentRepository.getLikedIds(userId, animeId)
        ]);

        const hasMore = rawComments.length > take;
        const comments = hasMore ? rawComments.slice(0, take) : rawComments;

        return {
            comments,
            total,
            page: currentPage,
            limit: take,
            hasMore,
            likedIds
        };
    },

    async listReplies(parentId) {
        const id = Number(parentId);
        if (!id) throw new ResponseError(400, "ID komentar tidak valid.");
        return commentRepository.getReplies(id);
    },

    async create(userId, { animeId, content, parentId }) {
        if (!animeId) {
            throw new ResponseError(400, "animeId wajib diisi.");
        }
        const cleanContent = sanitizeContent(content);

        let parent = null;
        if (parentId !== undefined && parentId !== null) {
            parent = await commentRepository.findById(Number(parentId));
            if (!parent) {
                throw new ResponseError(404, "Komentar yang dibalas tidak ditemukan.");
            }
            // Jaga tetap 1 level: balasan hanya boleh ke komentar utama
            if (parent.parentId !== null) {
                throw new ResponseError(400, "Tidak bisa membalas sebuah balasan.");
            }
            // Balasan harus di anime yang sama dengan induknya
            if (parent.animeId !== animeId) {
                throw new ResponseError(400, "Anime tidak sesuai dengan komentar induk.");
            }
        }

        return commentRepository.create({
            userId,
            animeId,
            content: cleanContent,
            parentId: parent ? parent.id : null
        });
    },

    async edit(userId, id, content) {
        const commentId = Number(id);
        const comment = await commentRepository.findById(commentId);
        if (!comment) {
            throw new ResponseError(404, "Komentar tidak ditemukan.");
        }
        if (comment.userId !== userId) {
            throw new ResponseError(403, "Anda tidak berhak mengubah komentar ini.");
        }
        const cleanContent = sanitizeContent(content);
        return commentRepository.update(commentId, cleanContent);
    },

    async remove(userId, id) {
        const commentId = Number(id);
        const comment = await commentRepository.findById(commentId);
        if (!comment) {
            throw new ResponseError(404, "Komentar tidak ditemukan.");
        }
        if (comment.userId !== userId) {
            throw new ResponseError(403, "Anda tidak berhak menghapus komentar ini.");
        }
        await commentRepository.remove(commentId);
        return { message: "Komentar dihapus." };
    },

    async toggleLike(userId, id) {
        const commentId = Number(id);
        const comment = await commentRepository.findById(commentId);
        if (!comment) {
            throw new ResponseError(404, "Komentar tidak ditemukan.");
        }
        return commentRepository.toggleLike(commentId, userId);
    }
};
