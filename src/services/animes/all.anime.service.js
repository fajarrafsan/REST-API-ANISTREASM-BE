import { logger } from "../../application/logging.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { describeError } from "../../utils/describeError.js";

export async function getAllAnime() {
    // Menyimpan cache selama 24 jam (86400 detik) karena daftar indeks A-Z jarang berubah
    return getOrSetCache("all-anime-list", 86400, async () => {
        try {
            // 1. Ambil data list A-Z mentah dari Repository
            const list = await samehadakuRepository.getAllAnimeList();

            // 2. Map data untuk membersihkan string suffix "-sub-indo" pada ID anime secara rekursif
            const mappedList = list.map(group => ({
                startWith: group.startWith,
                animeList: (group.animeList ?? []).map(anime => ({
                    title: anime.title,
                    animeId: anime.animeId?.replace(/-sub-indo$/i, "") ?? ""
                }))
            }));

            return mappedList;

        } catch (error) {
            logger.error("ERROR GET ALL ANIME LIST SERVICE", describeError(error));
            throw error;
        }
    });
}