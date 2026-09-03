const defaultOrigins = [
    "http://localhost:5173",
    "https://anistreasm-fe-nine.vercel.app",
    "https://anistream.fajarrafsan.my.id"
];

// Vercel menerbitkan URL berbeda untuk tiap branch dan tiap deployment.
const vercelProjectOrigin = /^https:\/\/(anistreasm|anistream)-fe-[a-z0-9-]+\.vercel\.app$/i;

export function createCorsOptions(configuredOrigins = process.env.CORS_ORIGIN) {
    const allowedOrigins = (configuredOrigins || defaultOrigins.join(","))
        .split(",")
        // Origin browser tidak memiliki trailing slash, termasuk untuk root URL.
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);

    return {
        origin: (origin, callback) => {
            const allowed = !origin || allowedOrigins.includes(origin) || vercelProjectOrigin.test(origin);
            // Jangan ubah origin yang tidak diizinkan menjadi error server 500.
            callback(null, allowed);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    };
}
