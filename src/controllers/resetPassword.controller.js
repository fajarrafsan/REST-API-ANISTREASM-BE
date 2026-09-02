import resetPasswordService from "../services/resetPassword.service.js";

// POST /api/users/forgot-password  { email }
export async function forgotPassword(req, res, next) {
    try {
        const result = await resetPasswordService.requestResetPassword(req.body);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

// POST /api/users/reset-password  { token, password }
export async function resetPassword(req, res, next) {
    try {
        const result = await resetPasswordService.confirmResetPassword(req.body);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/user/password  (login required) { currentPassword, newPassword }
export async function changePassword(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await resetPasswordService.changePassword(userId, req.body);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}
