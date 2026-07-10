import express from "express";
import animeController from "../controllers/anime.controller.js";

const animeRoute = express.Router();
animeRoute.get('/api/anime/home', animeController.homeAnime);
animeRoute.get('/api/hero-anime/home', animeController.homeHeroAnime);
animeRoute.get('/api/anime-complete/home', animeController.homeAnimeComplete);
animeRoute.get('/api/anime/search', animeController.search);
animeRoute.get('/api/anime/genres', animeController.getGenreListHandler);  
animeRoute.get('/api/anime/popular', animeController.popularAnimeHandler);
animeRoute.get('/api/anime/complete', animeController.ListCompleteHandler);
animeRoute.get('/api/anime/ongoing', animeController.ongoingAnimeHandler);
animeRoute.get('/api/anime/recent', animeController.recentAnimeHandler);
animeRoute.get('/api/anime/movies', animeController.moviesAnimeHandler);
animeRoute.get('/api/anime/all', animeController.allAnimeHandler);
animeRoute.get('/api/anime/schedule', animeController.scheduleHandler);
animeRoute.get('/api/anime/episode/:episodeId', animeController.episodeDetailHandler); 
animeRoute.get('/api/anime/server/:serverId', animeController.serverUrlHandler); 
animeRoute.get('/api/anime/genres/:genreId', animeController.animeByGenreHandler);    
animeRoute.get('/api/anime/detail/:slug', animeController.getAnimeDetail);

export { animeRoute };