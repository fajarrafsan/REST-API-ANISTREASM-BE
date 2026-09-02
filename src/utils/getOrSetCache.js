// getOrSetCache.js
import { logger } from "../application/logging.js";
import redisClient from "../application/redisClient.js";

const pendingFetches = new Map();

// Salinan cadangan berumur panjang, dipakai hanya ketika upstream gagal.
// Tanpa ini, satu 403 dari upstream langsung mengosongkan halaman meskipun
// kita baru saja punya data yang benar beberapa menit sebelumnya.
const STALE_TTL_SECONDS = 60 * 60 * 24 * 3;
const staleKeyOf = (key) => `${key}:stale`;

// Upstream membalas 403 "Plana AI Detector" dan mem-ban IP selama 30 menit
// ketika lalu lintas dianggap mencurigakan. Terus menembaki upstream selama
// ban hanya memperpanjangnya, jadi sekali terdeteksi kita berhenti mencoba
// dan menyajikan cadangan sampai jendela ban lewat.
const BAN_KEY = "upstream:banned";
const BAN_COOLDOWN_SECONDS = 60 * 31;

function isUpstreamBan(error) {
    if (error?.response?.status !== 403) return false;
    const body = error.response.data;
    const text = typeof body === "string" ? body : JSON.stringify(body ?? "");
    return /plana|detector|ban/i.test(text);
}

export async function getOrSetCache(key, ttlInSeconds, fetchIn) {
    // Redis mati: tidak ada cache dan tidak ada cadangan, jadi upstream saja.
    if (redisClient.status !== "ready") {
        console.log(`[CACHE] Redis not ready, skipping cache for "${key}"`);
        return await fetchIn();
    }

    try {
        const cached = await redisClient.get(key);
        if (cached) {
            console.log(`[CACHE] HIT "${key}"`);
            return JSON.parse(cached);
        }
    } catch (error) {
        // Kegagalan baca bukan alasan untuk berhenti; lanjut ambil dari upstream.
        logger.warn(`[CACHE] Gagal membaca "${key}": ${error.message}`);
    }

    console.log(`[CACHE] MISS "${key}"`);

    // Selama cooldown ban, jangan sentuh upstream sama sekali.
    const banned = await redisClient.get(BAN_KEY).catch(() => null);
    if (banned) {
        const stale = await redisClient.get(staleKeyOf(key)).catch(() => null);
        if (stale) {
            console.log(`[CACHE] Upstream sedang di-ban — menyajikan cadangan "${key}"`);
            return JSON.parse(stale);
        }
        throw new Error("Upstream sedang memblokir permintaan dan tidak ada data cadangan.");
    }

    if (pendingFetches.has(key)) {
        console.log(`[CACHE] "${key}" already in-flight, reusing pending fetch`);
        return await pendingFetches.get(key);
    }

    const fetchPromise = (async () => {
        try {
            const data = await fetchIn();
            const payload = JSON.stringify(data);

            try {
                await redisClient.setex(key, ttlInSeconds, payload);
                await redisClient.setex(staleKeyOf(key), STALE_TTL_SECONDS, payload);
                console.log(`[CACHE] STORED "${key}" | payload length: ${payload.length}`);
            } catch (error) {
                // Data sudah di tangan — gagal menyimpan tidak boleh menggagalkan request.
                logger.warn(`[CACHE] Gagal menyimpan "${key}": ${error.message}`);
            }

            return data;
        } catch (error) {
            // Upstream gagal (403, timeout, dsb). Sajikan salinan terakhir yang
            // diketahui baik daripada memaksa UI menampilkan halaman kosong.
            if (isUpstreamBan(error)) {
                await redisClient
                    .setex(BAN_KEY, BAN_COOLDOWN_SECONDS, new Date().toISOString())
                    .catch(() => null);
                logger.warn("[CACHE] Upstream memblokir IP kita — menghentikan permintaan keluar sementara.");
            }

            const stale = await redisClient.get(staleKeyOf(key)).catch(() => null);

            if (stale) {
                logger.warn(
                    `[CACHE] Upstream gagal untuk "${key}" (${error.message}) — menyajikan data cadangan.`
                );
                return JSON.parse(stale);
            }

            logger.error(`[CACHE] Upstream gagal untuk "${key}" dan tidak ada cadangan:`, error);
            throw error;
        } finally {
            pendingFetches.delete(key);
        }
    })();

    pendingFetches.set(key, fetchPromise);
    return await fetchPromise;
}
