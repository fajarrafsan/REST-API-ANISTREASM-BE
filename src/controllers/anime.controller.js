import { getAnimeComplete } from "../services/animes/complete.anime.service.js";
import { getAnimeDetailBySlug } from "../services/animes/detail.anime.service.js";
import { getHeroAnimeHome } from "../services/animes/hero.anime.service.js";
import { getHomeAnime } from "../services/animes/home.anime.service.js";
import { searchAnime } from "../services/animes/search.anime.service.js";
import { getEpisodeDetail, getServerUrl } from "../services/animes/server.anime.service.js";
import { getGenreList } from "../services/animes/genre.anime.service.js";
import { getPopularAnimeList } from "../services/animes/popular.anime.service.js";
import { getListComplete } from "../services/animes/list.complete.anime.service.js";
import { getOngoingAnimeList } from "../services/animes/ongoing.anime.service.js";
import { getRecentAnimeList } from "../services/animes/recent.anime.service.js";
import { getAnimeMovies } from "../services/animes/movies.anime.service.js";
import { getAllAnime } from "../services/animes/all.anime.service.js";
import { getAnimeByGenre } from "../services/animes/genreList.anime.service.js";
import { getSchedule } from "../services/animes/schedule.anime.service.js";
import { getBatchList, getBatchDetail } from "../services/animes/batch.anime.service.js";

async function homeAnime(req, res, next) {
    try {
        const result = await getHomeAnime();
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function homeHeroAnime(req, res, next) {
    try {
        const result = await getHeroAnimeHome();
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function homeAnimeComplete(req, res, next) {
    try {
        const result = await getAnimeComplete();
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function search(req, res, next) {
    try {
        const { q } = req.query;
        console.log("MASUK", q);

        if (!q?.trim()) {
            return res.status(400).json({
                success: false,
                errors: "Keyword is required"
            });
        }

        const result = await searchAnime(q);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getAnimeDetail(req, res, next) {
    try {
        const { slug } = req.params;
        console.log("SLUG : ", slug);

        if (!slug?.trim()) {
            return res.status(400).json({
                success: false,
                errors: "Slug is required"
            });
        }

        const result = await getAnimeDetailBySlug(slug);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export async function episodeDetailHandler(req, res) {
    try {
        const { episodeId } = req.params;
        const data = await getEpisodeDetail(episodeId);
        return res.json({ status: "success", data });
    } catch (error) {
        return res.status(error.response?.status ?? 500).json({
            status: "error",
            errors: error.message
        });
    }
}

// ✅ FE hit ini saat user pilih server/resolusi
export async function serverUrlHandler(req, res) {
    try {
        const { serverId } = req.params;
        const data = await getServerUrl(serverId);
        return res.json({ status: "success", data });
    } catch (error) {
        return res.status(error.response?.status ?? 500).json({
            status: "error",
            errors: error.message
        });
    }
}



export async function getGenreListHandler(req, res, next) {
    try {
        const data = await getGenreList();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function popularAnimeHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await getPopularAnimeList(page);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function ListCompleteHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const order = req.query.order || 'latest';

        const result = await getListComplete(page, order);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function ongoingAnimeHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const order = req.query.order || 'popular';

        const result = await getOngoingAnimeList(page, order);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function recentAnimeHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await getRecentAnimeList(page);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function moviesAnimeHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await getAnimeMovies(page);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
}

export async function allAnimeHandler(req, res, next) {
    try {
        const result = await getAllAnime();
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export async function animeByGenreHandler(req, res, next) {
    try {
        const { genreId } = req.params; // Mengambil variabel :genreId dari path url
        const page = parseInt(req.query.page) || 1; // Mengambil nomor halaman dari query url

        const result = await getAnimeByGenre(genreId, page);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
}

export async function scheduleHandler(req, res, next) {
    try {
        const data = await getSchedule();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function batchListHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await getBatchList(page);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function batchDetailHandler(req, res, next) {
    try {
        const { batchId } = req.params;

        if (!batchId?.trim()) {
            return res.status(400).json({
                success: false,
                errors: "Batch ID is required"
            });
        }

        const result = await getBatchDetail(batchId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export default { homeAnime, homeHeroAnime, homeAnimeComplete, search, getAnimeDetail, episodeDetailHandler, serverUrlHandler, getGenreListHandler, popularAnimeHandler, ListCompleteHandler, ongoingAnimeHandler, recentAnimeHandler, moviesAnimeHandler, allAnimeHandler, animeByGenreHandler, scheduleHandler, batchListHandler, batchDetailHandler };