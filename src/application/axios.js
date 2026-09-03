import axios from "axios";

const AXIOS_TIMEOUT = parseInt(process.env.AXIOS_TIMEOUT) || 15000;

// Upstream berada di balik proteksi bot yang menolak permintaan dari IP
// datacenter. Header default axios ("User-Agent: axios/1.x", tanpa Accept
// atau Accept-Language) membuat permintaan makin mudah dikenali sebagai bot,
// jadi kirim set header selayaknya browser.
const BROWSER_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": process.env.ANIME_API_URL ?? "https://www.sankavollerei.web.id"
};

const animeApi = axios.create({
    baseURL: process.env.ANIME_API_URL,
    timeout: AXIOS_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        ...BROWSER_HEADERS
    }
});

const AnilistApi = axios.create({
    baseURL: process.env.ANILIST_API,
    timeout: AXIOS_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

export { animeApi, AnilistApi };