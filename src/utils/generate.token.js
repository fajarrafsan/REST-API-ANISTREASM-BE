import jwt from "jsonwebtoken";
import redisClient from "../application/redisClient.js";
import { logger } from "../application/logging.js";

function parseExpiresIn(value) {
    if (!value) return 900;
    const match = value.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return 900;
    const num = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * (multipliers[unit] || 60);
}

async function generateToken(user) {
    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
    );

    try {
        if (redisClient.status === "ready") {
            await redisClient.set(
                `session:${user.id}:access`,
                token,
                "EX",
                parseExpiresIn(process.env.JWT_EXPIRES)
            );
        }
    } catch (error) {
        logger.error("Generate access token redis error:", error);
    }

    return token;
}

async function generateRefreshToken(user) {
    const refreshToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_REFRESH }
    );

    try {
        if (redisClient.status === "ready") {
            await redisClient.set(
                `session:${user.id}:refresh`,
                refreshToken,
                "EX",
                parseExpiresIn(process.env.JWT_EXPIRES_REFRESH)
            );
        }
    } catch (error) {
        logger.error("Generate refresh token redis error:", error);
    }

    return refreshToken;
}

export { generateToken, generateRefreshToken };