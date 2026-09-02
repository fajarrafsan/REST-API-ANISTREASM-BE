
-- AlterTable
ALTER TABLE "watch_histories" ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "progressSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "anime_ratings" (
    "id" SERIAL NOT NULL,
    "animeId" VARCHAR(255) NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anime_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_password_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_password_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anime_ratings_animeId_idx" ON "anime_ratings"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "anime_ratings_userId_animeId_key" ON "anime_ratings"("userId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_tokens_token_key" ON "reset_password_tokens"("token");

-- CreateIndex
CREATE INDEX "reset_password_tokens_userId_idx" ON "reset_password_tokens"("userId");

-- AddForeignKey
ALTER TABLE "anime_ratings" ADD CONSTRAINT "anime_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_password_tokens" ADD CONSTRAINT "reset_password_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

