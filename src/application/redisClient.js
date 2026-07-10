import Redis from "ioredis";
import { logger } from "./logging.js";

const redisClient = new Redis({
    port: Number(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    db: Number(process.env.REDIS_DB) || 0,
    retryStrategy: (times) => {
        const delay = Math.min(times * 500, 5000);
        return delay;
    },
    connectTimeout: 10000
});

let wasConnected = false;

redisClient.on("connect", () => {
    if (!wasConnected) {
        logger.info("Redis connected");
        wasConnected = true;
    }
});

redisClient.on("close", () => {
    if (wasConnected) {
        logger.error("Redis disconnected");
        wasConnected = false;
    }
});

redisClient.on("error", (err) => {
    if (!wasConnected) {
        logger.error(`Redis connection error: ${err.message}`);
        return;
    }
    wasConnected = false;
    logger.error("Redis disconnected");
});

export default redisClient;
