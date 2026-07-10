import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

// Map nama hari ke key singkat
const DAY_KEY_MAP = {
    Sunday: "SUN",
    Monday: "MON",
    Tuesday: "TUE",
    Wednesday: "WED",
    Thursday: "THU",
    Friday: "FRI",
    Saturday: "SAT"
};

export async function getSchedule() {
    return getOrSetCache(
        "anime-schedule",
        1800, // 30 menit
        async () => {
            try {
                logger.info("[getSchedule] Fetching anime schedule");

                const days = await samehadakuRepository.getSchedule();

                // Ubah array days → object { SUN: [...], MON: [...], ... }
                const schedule = {};
                for (const dayData of days) {
                    const key = DAY_KEY_MAP[dayData.day] ?? dayData.day;
                    schedule[key] = dayData.animeList.map(anime => ({
                        title: anime.title,
                        poster: anime.poster,
                        type: anime.type,
                        score: anime.score ?? null,
                        estimation: anime.estimation ?? null,
                        genres: anime.genres ?? [],
                        animeId: anime.animeId
                    }));
                }

                return schedule;

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getSchedule] Upstream error", {
                        status: error.response?.status,
                        data: error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}