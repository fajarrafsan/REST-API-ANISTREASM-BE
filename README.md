<div align="center">

# 🍥 ANISTREAM

### *API Streaming Anime — Samehadaku Scraper × AniList Metadata*

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white&style=for-the-badge)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white&style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white&style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white&style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtoken&logoColor=white&style=for-the-badge)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Upload-3448C5?logo=cloudinary&logoColor=white&style=for-the-badge)
![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=white&style=for-the-badge)

<br/>

```
 █████╗ ███╗   ██╗██╗███████╗████████╗██████╗ ███████╗ █████╗ ███╗   ███╗
██╔══██╗████╗  ██║██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔══██╗████╗ ████║
███████║██╔██╗ ██║██║███████╗   ██║   ██████╔╝█████╗  ███████║██╔████╔██║
██╔══██║██║╚██╗██║██║╚════██║   ██║   ██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║
██║  ██║██║ ╚████║██║███████║   ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
```

**「 無料アニメストリーミングAPI 」** — *Nonton anime apa pun, kapan pun, tanpa batas.*

</div>

---

## 👁️ Perkenalan

**ANISTREAM** adalah backend REST API platform streaming anime yang dibangun dengan arsitektur *service layer* yang bersih. Backend ini **tidak menyimpan video sendiri** — ia menggabungkan kekuatan dua sumber data:

| 🎴 Sumber | 🔧 Peran |
|-----------|----------|
| **Samehadaku API** | Episode, server streaming, link download, jadwal tayang, katalog |
| **AniList GraphQL** | Banner, trailer, karakter, seiyuu (VA), rating, studio, ranking, rekomendasi |

> ⚡ Hasilnya: **detail anime super-lengkap** yang biasanya cuma dimiliki situs streaming berbayar.

---

## 📑 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🧩 Arsitektur](#-arsitektur)
- [🛠️ Teknologi](#️-teknologi)
- [📂 Struktur Proyek](#-struktur-proyek)
- [⚙️ Environment Variables](#️-environment-variables)
- [📦 Instalasi](#-instalasi)
- [📚 Dokumentasi API](#-dokumentasi-api)
- [🗄️ Skema Database](#️-skema-database)
- [🧠 Caching Strategy](#-caching-strategy)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Kontribusi](#-kontribusi)
- [🎯 Roadmap](#-roadmap)
- [📜 Lisensi](#-lisensi)

---

## ✨ Fitur Utama

| # | Fitur | Deskripsi | Status |
|---|-------|-----------|--------|
| 1 | 🧠 **Dual-Source Aggregation** | Scrape Samehadaku + enrich metadata AniList | ✅ |
| 2 | 🔐 **Autentikasi Ganda** | Email/password (argon2) + Google OAuth2 | ✅ |
| 3 | 👤 **Profil Dinamis** | Avatar & cover auto-optimasi Cloudinary | ✅ |
| 4 | ⭐ **Wishlist Cerdas** | Toggle favorit + bulk status check | ✅ |
| 5 | 📺 **Watch History** | Riwayat nonton otomatis (upsert) | ✅ |
| 6 | 💬 **Komentar Interaktif** | Reply 1 level, like, sortir, pagination | ✅ |
| 7 | 🕘 **Search History** | Riwayat pencarian + hapus massal | ✅ |
| 8 | 🕒 **Recent Activity** | Gabungan watched + wishlist terbaru | ✅ |
| 9 | 🚀 **Single-Flight Caching** | Redis cache + de-duplicate request | ✅ |
| 10 | 🛡️ **Keamanan Berlapis** | Rate limit, CORS, Joi, error sentral | ✅ |

---

### 🧠 1. Matcher Pintar — 6 Strategi Pencocokan

`src/utils/matcher.js` mencocokkan judul Samehadaku ke AniList dengan strategi bertingkat:

```
🔍 Judul Samehadaku
      │
      ▼
┌─────────────────────────────────────────────┐
│  1️⃣  Exact match        (normalized)        │
│  2️⃣  Loose match        (hanya huruf)       │
│  3️⃣  Substring          (containment)       │
│  4️⃣  Whole-word         (regex boundary)    │
│  5️⃣  Token containment  (≥70% kata cocok)   │
│  6️⃣  Dice coefficient   (threshold 0.45)    │
└─────────────────────────────────────────────┘
      │
      ▼
✨ AniList: banner · trailer · karakter · seiyuu
   rating · studio · ranking · rekomendasi · tags
```

### 🚀 9. Single-Flight Caching

```js
// 3 request bersamaan untuk data yang sama → SATU fetch, semua menunggu
if (pendingFetches.has(key)) {
  return await pendingFetches.get(key);  // 🎉 hemat quota API
}
```

- 🛟 Redis down → otomatis bypass langsung ke sumber data
- ⏱️ TTL pintar per data (5 menit s/d 24 jam)

### 🔐 10. Alur Autentikasi Berlapis

```
Browser ──► POST /login ──► argon2.verify ──► JWT sign
                                                 │
                                   ┌─────────────┴──────────────┐
                              accessToken (15m)            refreshToken (7d)
                                   │                              │
                                   ▼                              ▼
                          Cookie httpOnly                  Redis session:
                          session:{id}:access              session:{id}:refresh
                                   │                              │
      GET /api/user ◄── authMiddleware ◄───────────────────────────┘
      │   validasi JWT + cek Redis session
      ▼
  ✅ req.user
```

---

## 🧩 Arsitektur

```
┌──────────────┐     ┌───────────────────────────────────┐     ┌──────────────┐
│   Frontend   │◄───►│           ANISTREAM API           │◄───►│    Redis     │
│    (FE)      │     │  routes → controllers → services  │     │  cache/sesi  │
└──────────────┘     │             │  │  │  │             │     └──────────────┘
                     │             ▼  ▼  ▼  ▼             │
                     │     repositories      mappers      │     ┌──────────────┐
                     │             │                      │────►│  PostgreSQL  │
                     │             ▼                      │     │  (Prisma)    │
                     └───────────────────────────────────┘     └──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
         ┌─────────────────────┐        ┌─────────────────────┐
         │  Samehadaku (scraper)│        │  AniList (GraphQL) │
         │  episode & streaming │        │  metadata & enrich │
         └─────────────────────┘        └─────────────────────┘
```

> **Alur:** `Request` → `Route` → `Controller` (tipis) → `Service` (logika) → `Repository` (data) → `Mapper` (transform) → `JSON`

---

## 🛠️ Teknologi

| 🧰 Lapisan | 🔩 Teknologi | 📌 Versi |
|------------|--------------|----------|
| 🌐 Runtime | Node.js (ESM) | 18+ |
| ⚡ Framework | Express.js | 5.2 |
| 🗃️ ORM | Prisma | 6.19 |
| 💾 Database | PostgreSQL | 15+ |
| ⚙️ Cache & Session | Redis (ioredis) | 7+ |
| 🔐 Auth | JWT + argon2 + google-auth-library | - |
| ☁️ Upload | Multer + Cloudinary | - |
| 📡 HTTP Client | Axios (Samehadaku + AniList) | 1.16 |
| 🧾 Validasi | Joi | 18 |
| 📝 Logging | Winston | 3.19 |
| 🚦 Rate Limit | express-rate-limit + rate-limit-redis | - |
| 🧪 Testing | Jest + Supertest + Babel | 30 |
| 🔍 Linting | ESLint | 10 |

---

## 📂 Struktur Proyek

```
BE/
├── 📄 prisma/
│   ├── 📁 migrations/          # Riwayat migrasi database
│   └── 🧬 schema.prisma        # 6 model + constraint unique + cascade
├── 📄 src/
│   ├── 🚀 app.js               # Entry point server
│   ├── ⚙️ application/         # web · database · redisClient · axios · logging
│   ├── 🎛️ config/              # cookieConfig · cloudinaryClient
│   ├── 🎮 controllers/         # Handler request HTTP (tipis)
│   ├── 💥 error/               # ResponseError (status + message)
│   ├── 🔄 mappers/             # Transform data mentah → response API
│   ├── 🛡️ middlewares/         # auth · error · rate.limit · upload
│   ├── 📊 repositories/        # Akses Prisma & external API
│   ├── 🗺️ routes/              # Definisi seluruh endpoint
│   ├── 🧠 services/            # Logika bisnis (13 service anime + user)
│   ├── 🧰 utils/               # matcher · getOrSetCache · generate.token
│   └── ✔️ validation/          # Skema Joi
├── 🔒 .env                     # ⚠️ JANGAN di-commit!
└── 📦 package.json
```

---

## ⚙️ Environment Variables

<details>
<summary>📋 Klik untuk membuka daftar lengkap env</summary>

```env
# ── Server ─────────────────────────────────────────
PORT=3000

# ── Database PostgreSQL ────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# ── Redis ──────────────────────────────────────────
REDIS_URL=rediss://:pass@host:port          # prioritas jika diisi
REDIS_PORT=6379                             # fallback lokal
REDIS_HOST=localhost
REDIS_DB=0

# ── JWT ────────────────────────────────────────────
JWT_SECRET=random_rahasia_1
JWT_EXPIRES=15m                             # access token
JWT_REFRESH_SECRET=random_rahasia_2
JWT_EXPIRES_REFRESH=7d                      # refresh token

# ── External API ───────────────────────────────────
ANIME_API_URL=https://api.anime-api.example.com
ANILIST_API=https://graphql.anilist.co
ANILIST_TIMEOUT=3000
AXIOS_TIMEOUT=15000

# ── CORS & Cookie ──────────────────────────────────
CORS_ORIGIN=http://localhost:5173,https://anistreasm-fe-nine.vercel.app,https://anistream.fajarrafsan.my.id
COOKIE_SECURE=true
COOKIE_SAMESITE=none
FRONTEND_URL=https://anistream.fajarrafsan.my.id

# ── Cloudinary ─────────────────────────────────────
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
CLOUDINARY_ROOT_FOLDER=anistream

# ── Rate Limit ─────────────────────────────────────
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=20

# ── Upload ─────────────────────────────────────────
UPLOAD_DIR=uploads
MAX_FILE_SIZE=2097152                       # 2MB
```

</details>

Saat mengganti domain frontend, perbarui `CORS_ORIGIN` pada **Environment** layanan backend Render, lalu simpan dan deploy ulang. Nilai environment ini menggantikan daftar origin bawaan di kode; perubahan `.env` lokal tidak memperbarui environment Render. Gunakan origin lengkap (`https://anistream.fajarrafsan.my.id`) tanpa path atau trailing slash. Karena frontend memakai cookie (`withCredentials: true`), jangan gunakan `*` sebagai origin. Sesuaikan juga `FRONTEND_URL` agar tautan reset password mengarah ke domain baru.

Jalankan `pnpm test:cors` untuk memeriksa header CORS dan preflight tanpa database atau Redis.

---

## 📦 Instalasi

### Prasyarat

| ✅ Butuh | 📌 Minimal |
|----------|------------|
| Node.js | v18 |
| PostgreSQL | v14 |
| Redis | v7 |

### Langkah Cepat 🚀

```bash
# 1. Clone & masuk folder
git clone <url-repo> BE
cd BE

# 2. Install dependensi
pnpm install

# 3. Setup environment
cp .env.example .env

# 4. Migrasi database
npx prisma migrate deploy
npx prisma generate

# 5. Jalankan server 🔥
pnpm dev        # development
# atau
pnpm start      # production
```

> 🎯 Server siap di `http://localhost:3000`

---

## 📚 Dokumentasi API

### 📜 Konvensi Response

```json
// ✅ Sukses
{ "success": true, "data": {} }

// ❌ Error
{ "success": false, "errors": "pesan error" }
```

---

### 🔓 Public Routes — Tanpa Login

<details>
<summary><b>🏠 Home & Hero</b></summary>

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/anime/home` | List home (15 item, enrich AniList) |
| GET | `/api/hero-anime/home` | 3 anime hero + banner + synonyms |
| GET | `/api/anime-complete/home` | Anime completed home |

</details>

<details>
<summary><b>🧭 Eksplorasi</b></summary>

| Method | Endpoint | Deskripsi | Query |
|--------|----------|-----------|-------|
| GET | `/api/anime/all` | Indeks A-Z | - |
| GET | `/api/anime/popular` | Anime populer | `page` |
| GET | `/api/anime/complete` | Anime selesai | `page`, `order=latest` |
| GET | `/api/anime/ongoing` | Anime berjalan | `page`, `order=popular` |
| GET | `/api/anime/recent` | Update terbaru | `page` |
| GET | `/api/anime/movies` | Film anime | `page` |
| GET | `/api/anime/genres` | Daftar genre | - |
| GET | `/api/anime/genres/:genreId` | Anime per genre | `page` |
| GET | `/api/anime/schedule` | Jadwal per hari (SUN–SAT) | - |
| GET | `/api/anime/search?q=` | Pencarian | `q` ⚠️ wajib |
| GET | `/api/anime/detail/:slug` | Detail lengkap anime | - |

</details>

<details>
<summary><b>🎬 Episode & Server</b></summary>

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/anime/episode/:episodeId` | Detail episode: server, download, navigasi |
| GET | `/api/anime/server/:serverId` | URL embed server (auto-transform) |

```json
// GET /api/anime/episode/:episodeId
{
  "status": "success",
  "data": {
    "title": "Episode 1",
    "animeId": "naruto-episode-1",
    "defaultStreamingUrl": "https://...",
    "servers": [
      { "resolution": "480p", "serverList": [{ "title": "Server 1", "serverId": "abc123" }] }
    ],
    "hasPrevEpisode": false,
    "hasNextEpisode": true,
    "nextEpisode": "episode-2",
    "downloadFormats": [],
    "recommendedEpisodes": [],
    "movies": [],
    "synopsis": "...",
    "genres": ["Action", "Adventure"]
  }
}
```

```json
// GET /api/anime/server/:serverId
{
  "status": "success",
  "data": {
    "url": "https://wibufile.com/embed/xxxx",
    "rawUrl": "https://api.wibufile.com/embed/xxxx"
  }
}
```

> 🔄 Auto-transform: `api.wibufile.com` → `wibufile.com` · `filedon.co/view/` → `filedon.co/embed/`

</details>

<details>
<summary><b>🔐 Autentikasi</b></summary>

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/users/register` | `{ username, email, password }` |
| POST | `/api/users/login` | `{ email, password }` |
| POST | `/api/users/refresh` | cookie `refreshToken` |
| POST | `/api/google/login` | `{ token }` (Google id_token) |

```json
// POST /api/users/login
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user1",
    "email": "user1@mail.com",
    "provider": "LOCAL",
    "profil": { "bio": null, "avatar": null, "cover": null }
  },
  "accessToken": "eyJ..."
}
```

> 🍪 Token diset sebagai cookie `httpOnly` — access 15m · refresh 7d

</details>

---

### 🔐 Protected Routes — Wajib Login

> Header otomatis: cookie `accessToken`. Divalidasi JWT + dicek ke Redis.

<details>
<summary><b>👤 User & Profil</b></summary>

| Method | Endpoint | Deskripsi | Body / Form |
|--------|----------|-----------|-------------|
| GET | `/api/user` | Data user + profil | - |
| GET | `/api/user/profile` | Profil (bio, avatar, cover) | - |
| PUT | `/api/user/profile` | Update profil | `bio`, `avatar` (file), `cover` (file) |
| POST | `/api/user/logout` | Logout (hapus sesi + cookie) | - |
| GET | `/api/user/recent-activity` | 5 watched + 5 wishlist terakhir | - |

> 🖼️ Upload avatar/cover: **JPEG/PNG/WebP** · maks **5MB** · otomatis di-optimasi Cloudinary

</details>

<details>
<summary><b>⭐ Wishlist</b></summary>

| Method | Endpoint | Deskripsi | Body |
|--------|----------|-----------|------|
| POST | `/api/anime/wishlist/toggle` | Tambah / hapus | `{ animeId, title, poster? }` |
| GET | `/api/anime/wishlist` | Semua wishlist | - |
| GET | `/api/anime/wishlist/ids` | Array `animeId` untuk cek bulk | - |
| DELETE | `/api/anime/wishlist/:animeId` | Hapus satu | - |

</details>

<details>
<summary><b>📺 Watch History</b></summary>

| Method | Endpoint | Deskripsi | Body |
|--------|----------|-----------|------|
| POST | `/api/anime/watch-history` | Simpan riwayat nonton | `{ animeId, episodeId, title, episodeTitle?, poster? }` |
| GET | `/api/anime/watch-history` | Riwayat (terbaru dulu) | - |
| DELETE | `/api/anime/watch-history/:id` | Hapus satu / semua (`all`) | - |

</details>

<details>
<summary><b>💬 Komentar & Like</b></summary>

| Method | Endpoint | Deskripsi | Query / Body |
|--------|----------|-----------|--------------|
| GET | `/api/comments` | List komentar utama | `animeId`⚠️, `sort`(`newest`/`oldest`/`popular`), `page`, `limit` |
| GET | `/api/comments/:id/replies` | Balasan komentar | - |
| POST | `/api/comments` | Tambah komentar/balasan | `{ animeId, content, parentId? }` |
| PATCH | `/api/comments/:id` | Edit (pemilik saja) | `{ content }` |
| DELETE | `/api/comments/:id` | Hapus (pemilik saja) | - |
| POST | `/api/comments/:id/like` | Toggle like | - |

> 📏 Reply maks 1 level · konten maks 1000 karakter · wajib di anime yang sama

</details>

<details>
<summary><b>🕘 Search History</b></summary>

| Method | Endpoint | Deskripsi | Body |
|--------|----------|-----------|------|
| POST | `/api/search-history` | Simpan riwayat pencarian | `{ keyword, animeId, title, poster?, type? }` |
| GET | `/api/search-history` | Riwayat user | - |
| DELETE | `/api/search-history/:id` | Hapus satu / semua (`all`) | - |

</details>

---

## 🗄️ Skema Database

```
┌───────────────────┐       1 : 1       ┌───────────────────┐
│       User        │ ───────────────►  │      Profil       │
│  id • username    │                   │  bio • avatar     │
│  email • password │                   │  cover • userId   │
│  provider • google│                   └───────────────────┘
└────┬──────────────┘
     │ 1 : N (Cascade delete)
     ├──────────► ┌───────────────────┐
     │            │   SearchHistory   │  @@unique(userId, animeId)
     ├──────────► ┌───────────────────┐
     │            │     Wishlist      │  @@unique(userId, animeId)
     ├──────────► ┌───────────────────┐
     │            │   WatchHistory    │  @@unique(userId, episodeId)
     ├──────────► ┌───────────────────┐
     │            │     Comment       │  parentId → balasan (1 level)
     └──────────► ┌───────────────────┐
                  │   CommentLike     │  @@unique(commentId, userId)
                  └───────────────────┘
```

> 🔗 Semua relasi `onDelete: Cascade` → hapus user = hapus seluruh datanya.

---

## 🧠 Caching Strategy

### 📦 Data Cache (getOrSetCache)

| 🔑 Key | ⏱️ TTL | 📄 Data |
|--------|--------|---------|
| `anime-home` | 1 jam | Home anime |
| `hero-anime-home` | 1 jam | Hero anime |
| `complete-anime-home` | 1 jam | Completed home |
| `anime-search:{keyword}` | 1 jam | Hasil pencarian |
| `anime-detail:{slug}` | 1 jam | Detail anime |
| `episode-detail:{episodeId}` | 30 mnt | Detail episode |
| `server-url:{serverId}` | 30 mnt | URL server |
| `anime-schedule` | 30 mnt | Jadwal tayang |
| `ongoing-anime-list:*` | 30 mnt | Anime ongoing |
| `recent-anime-list:*` | 5 mnt | Update terbaru |
| `anime-list:*` | 1 jam | Daftar completed |
| `popular-anime-list:*` | 1 jam | Populer |
| `movies-anime-page-*` | 1 jam | Film anime |
| `genre-anime-*-page-*` | 1 jam | Per genre |
| `genre-list` | 24 jam | Daftar genre |
| `all-anime-list` | 24 jam | Indeks A-Z |

### 🔑 Session Cache (Token)

| 🔑 Key | 📄 Isi |
|--------|--------|
| `session:{userId}:access` | Access token aktif (TTL sesuai JWT) |
| `session:{userId}:refresh` | Refresh token aktif (TTL sesuai JWT) |

---

## 🧪 Testing

```bash
pnpm test
```

- 🧪 **Jest 30** + **Supertest** — konfigurasi siap di `package.json`
- 📁 File test: folder `test/` · setup di `test/setup.js`
- 🔄 Transform otomatis via Babel

---

## 🚀 Deployment

```bash
pnpm install --prod
npx prisma migrate deploy
npx prisma generate
node src/app.js
```

**Prasyarat produksi:**
- ✅ PostgreSQL dapat diakses
- ✅ Redis tersedia
- ✅ Env lengkap (tabel di atas)
- ✅ HTTPS — agar cookie `secure` & `sameSite=none` bekerja lintas origin

---

## 🤝 Kontribusi

```
1. 🍴 Fork repository
2. 🌿 Buat branch fitur   →  git checkout -b feature/nama-fitur
3. 💾 Commit jelas        →  feat: / fix: / docs: / refactor: / test:
4. 🚀 Push ke branch
5. 🔀 Buat Pull Request
```

---

## 🎯 Roadmap

- [ ] 📄 Swagger / OpenAPI spec
- [ ] 📄 Pagination pada `/api/anime/all`
- [ ] 🚦 Aktifkan rate limiter global
- [ ] 🔔 Notifikasi episode baru (real-time)
- [ ] 🌐 Multi-bahasa subtitle
- [ ] 📊 Dashboard admin statistik tontonan

---

## 📜 Lisensi

<div align="center">

**ISC** © 2026 ANISTREAM — dibuat dengan 💙, ☕, dan rasa *kuy* untuk para otaku

---

<a href="#top">⬆️ Kembali ke atas</a>

</div>
