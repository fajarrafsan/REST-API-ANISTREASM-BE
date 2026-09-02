import { animeApi } from "../application/axios.js";

export const samehadakuRepository = {
    async getHomeAnimeList() {
        const response = await animeApi.get('/anime/samehadaku/home');
        return response.data.data.recent.animeList;
    },

    async getGenreList() {
        const response = await animeApi.get(
            '/anime/samehadaku/genres'
        );
        return response.data.data.genreList;
    },

    async getAnimeDetail(animeId) {
        const response = await animeApi.get(`/anime/samehadaku/anime/${animeId}`);
        return response.data.data;
    },

    async getHeroAnimeList(limit = 3) {
        const response = await animeApi.get('/anime/samehadaku/home');
        return response.data.data.recent.animeList.slice(0, limit);
    },
    async getCompleteAnimeList() {
        const response = await animeApi.get('/anime/samehadaku/completed');
        return response.data.data.animeList;
    },

    async searchAnime(keyword) {
        const response = await animeApi.get('/anime/samehadaku/search', {
            params: { q: keyword }
        });

        return {
            animeList: response.data.data.animeList
        };
    },
    async getAnimeDetailBySlug(slug) {
        const response = await animeApi.get(
            `/anime/samehadaku/anime/${encodeURIComponent(slug)}`
        );

        return response.data.data;
    },

    async getEpisodeDetail(episodeId) {
        const response = await animeApi.get(
            `/anime/samehadaku/episode/${encodeURIComponent(episodeId)}`
        );
        return response.data.data;
    },

    async getServerUrl(serverId) {
        const response = await animeApi.get(
            `/anime/samehadaku/server/${encodeURIComponent(serverId)}`
        );
        return response.data.data.url;
    },

    async getPopularAnimeList(page = 1) {
        const response = await animeApi.get('/anime/samehadaku/popular', {
            params: { page }
        });
        return {
            animeList: response.data.data.animeList,
            pagination: response.data.pagination
        };
    },
    async getAnimeListComplete(page = 1, order = 'latest') {
        const response = await animeApi.get('/anime/samehadaku/completed', {
            params: { page, order }
        });
        return {
            animeList: response.data.data.animeList,
            pagination: response.data.pagination
        };
    },

    async getOngoingAnimeList(page = 1, order = 'popular') {
        const response = await animeApi.get('/anime/samehadaku/ongoing', {
            params: { page, order }
        });
        return {
            animeList: response.data.data.animeList,
            pagination: response.data.pagination
        };
    },

    async getRecentAnimeList(page = 1) {
        const response = await animeApi.get('/anime/samehadaku/recent', {
            params: { page }
        });
        return {
            animeList: response.data.data.animeList,
            pagination: response.data.pagination
        };
    },

    async getMoviesAnimeList(page = 1) {
        const response = await animeApi.get(`/anime/samehadaku/movies?page=${page}`);
        return {
            animeList: response.data.data.animeList,
            pagination: response.data.pagination
        };
    },

    async getAllAnimeList() {
        const response = await animeApi.get('/anime/samehadaku/list');
        return response.data.data.list;
    },
    async getAnimeListByGenre(genreId, page = 1) {
        const response = await animeApi.get(`/anime/samehadaku/genres/${genreId}?page=${page}`);
        return {
            animeList: response.data.data.animeList,
            pagination: response.data.pagination
        };
    },

    async getSchedule() {
        const response = await animeApi.get('/anime/samehadaku/schedule');
        return response.data.data.days;
    },

    async getBatchList(page = 1) {
        const response = await animeApi.get('/anime/samehadaku/batch', {
            params: { page }
        });
        return {
            batchList: response.data.data.batchList,
            pagination: response.data.pagination
        };
    },

    async getBatchDetail(batchId) {
        const response = await animeApi.get(
            `/anime/samehadaku/batch/${encodeURIComponent(batchId)}`
        );
        return response.data.data;
    }
};