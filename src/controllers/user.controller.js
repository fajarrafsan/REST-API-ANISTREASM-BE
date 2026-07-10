import { ResponseError } from "../error/response.error.js";
import authService from "../services/auth.service.js";
import { clearTokenCookies, setAccessTokenCookie, setRefreshTokenCookie } from "../utils/cookieHelper.js";
import multer from "multer";

async function userRegister(req, res, next) {
    try {
        const request = req.body;
        const result = await authService.register(request);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function userLogin(req, res, next) {
    try {
        const request = req.body;
        const result = await authService.login(request);
        setAccessTokenCookie(res, result.accessToken);
        setRefreshTokenCookie(res, result.refreshToken);
        return res.status(200).json({
            success: true,
            data: result.user,
            accessToken: result.accessToken
        });
    } catch (error) {
        next(error);
    }
}

async function refreshToken(req, res, next) {
    try {
        const result = await authService.refresh(req.cookies.refreshToken);

        setAccessTokenCookie(res, result.accessToken);

        return res.status(200).json({
            success: true,
            message: "Token refreshed"
        });
    } catch (error) {
        next(error);
    }
}

async function userLogout(req, res, next) {
    try {
        const userId = req.user.id;
        await authService.logout(userId);
        clearTokenCookies(res);
        return res.status(200).json({
            success: true,
            message: "Logout berhasil"
        });
    } catch (error) {
        next(error);
    }
}

async function getUser(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await authService.get(userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getUserProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await authService.getProfile(userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            // Throw ResponseError langsung dari fileFilter
            return cb(new ResponseError(400, "Hanya file gambar yang diizinkan (JPEG, PNG, WebP)"));
        }
        cb(null, true);
    }
});

// Wrapper multer agar error-nya masuk ke errorMiddleware Express
export const uploadProfileImages = (req, res, next) => {
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "cover", maxCount: 1 }
    ])(req, res, (err) => {
        if (!err) return next();

        // Error ukuran file dari multer
        if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ResponseError(400, "Ukuran file terlalu besar. Maksimal 5MB."));
        }

        // Error lain dari multer (termasuk ResponseError dari fileFilter)
        return next(err instanceof ResponseError ? err : new ResponseError(400, err.message));
    });
};

async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;

        const request = { bio: req.body.bio };

        if (req.files?.avatar?.[0]) {
            request.avatarFile = { buffer: req.files.avatar[0].buffer };
        }
        if (req.files?.cover?.[0]) {
            request.coverFile = { buffer: req.files.cover[0].buffer };
        }

        const result = await authService.update(userId, request);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export { updateProfile, getUserProfile };

export default { userRegister, userLogin, getUser, refreshToken, userLogout, updateProfile, getUserProfile };