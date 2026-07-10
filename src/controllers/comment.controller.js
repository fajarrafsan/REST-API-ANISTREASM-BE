import { commentService } from "../services/comment.service.js";

// GET /api/comments?animeId=..&sort=newest&page=1&limit=10
export async function getComments(req, res) {
    const userId = req.user.id;
    const { animeId, sort, page, limit } = req.query;

    const result = await commentService.list(userId, animeId, { sort, page, limit });
    return res.json({ data: result });
}

// GET /api/comments/:id/replies
export async function getReplies(req, res) {
    const { id } = req.params;
    const data = await commentService.listReplies(id);
    return res.json({ data });
}

// POST /api/comments   { animeId, content, parentId? }
export async function postComment(req, res) {
    const userId = req.user.id;
    const { animeId, content, parentId } = req.body;

    const comment = await commentService.create(userId, { animeId, content, parentId });
    return res.status(201).json({ data: comment });
}

// PATCH /api/comments/:id   { content }
export async function editComment(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    const comment = await commentService.edit(userId, id, content);
    return res.json({ data: comment });
}

// DELETE /api/comments/:id
export async function deleteComment(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await commentService.remove(userId, id);
    return res.json(result);
}

// POST /api/comments/:id/like   (toggle)
export async function likeComment(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await commentService.toggleLike(userId, id);
    return res.json({ data: result });
}
