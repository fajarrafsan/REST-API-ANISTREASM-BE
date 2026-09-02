
// AniList adalah sumber terbaik, tapi bukan satu-satunya. `fallback` adalah
// entri anime yang sama dari daftar ongoing Samehadaku, dipakai ketika AniList
// tidak tersedia. Tanpa itu, matinya AniList mengosongkan hampir setiap field
// dan mengganti poster cover dengan tangkapan layar episode.
export function mapHomeAnime(samehadakuAnime, anilistMatch, fallback = null) {
    const media = anilistMatch?.media;

    const episodeNumber =
        anilistMatch?.episode ?? samehadakuAnime.episodes ?? null;

    // Samehadaku mengirim skor sebagai string ("7.39") pada skala 0-10,
    // sedangkan AniList memakai bilangan bulat 0-100. Samakan ke skala AniList
    // supaya frontend tidak perlu tahu asal datanya.
    const fallbackScore = fallback?.score
        ? Math.round(parseFloat(fallback.score) * 10)
        : undefined;

    return {
        ...samehadakuAnime,
        episode: episodeNumber ? `Ep ${episodeNumber}` : "Ep ?",
        status:
            media?.status === "RELEASING" ? "ONGOING"
            : fallback?.status?.toUpperCase() === "ONGOING" ? "ONGOING"
            : fallback?.status ?? "?",
        // Poster episode dipakai paling akhir: itu tangkapan layar, bukan cover.
        poster: media?.coverImage?.large || fallback?.poster || samehadakuAnime.poster,
        duration: media?.duration || "24",
        studios: media?.studios?.nodes[0]?.name || null,
        score: media?.averageScore ?? fallbackScore,
        season: media?.season,
        genreList:
            media?.genres?.slice(0, 2)
            ?? fallback?.genreList?.slice(0, 2).map((g) => g.title),
        synopsis: media?.description || "",
        year: media?.seasonYear
    };
}

export function mapCompleteAnime(samehadakuAnime, media) {
    return {
        ...samehadakuAnime,
        episode: `Ep ${media?.episodes || "?"}`,
        status: media?.status === "FINISHED" ? "COMPLETE" : "ONGOING",
        poster: media?.coverImage?.large || samehadakuAnime.poster,
        duration: media?.duration,
        studios: media?.studios?.nodes?.[0]?.name || null,
        score: media?.averageScore,
        season: media?.season,
        genreList: media?.genres?.slice(0, 2),
        synopsis: media?.description || "",
        year: media?.seasonYear
    };
}

export function mapAnimeDetail(samehadaData, anilistData = null) {
    const base = {
        animeId: samehadaData.animeId,
        title: samehadaData.japanese,
        poster: samehadaData.poster,
        synopsis:
            samehadaData.synopsis?.paragraphs?.join("\n\n") ||
            "Tidak ada sinopsis",

        genres:
            samehadaData.genreList?.map(
                genre => genre.title
            ) || [],

        episodes:
            samehadaData.episodeList?.map(ep => ({
                title: `Episode ${ep.title}`,
                slug: ep.episodeId
            })) || []
    };

    if (!anilistData) {
        return base;
    }

    const globalRank = anilistData.rankings?.find(
        rank =>
            rank.type === "RATED" &&
            rank.allTime === true
    );

    const popularityRank =
        anilistData.rankings?.find(
            rank =>
                rank.type === "POPULAR" &&
                rank.allTime === true
        );

    return {
        ...base,

        anilistId: anilistData.id,

        title: {
            main: samehadaData.japanese,
            romaji: anilistData.title?.romaji,
            english: anilistData.title?.english,
            native: anilistData.title?.native
        },

        description: anilistData.description,

        poster:
            anilistData.coverImage?.extraLarge ||
            anilistData.coverImage?.large ||
            samehadaData.poster,

        bannerImage:
            anilistData.bannerImage || null,

        coverImage: {
            extraLarge:
                anilistData.coverImage?.extraLarge,
            large:
                anilistData.coverImage?.large,
            medium:
                anilistData.coverImage?.medium
        },

        totalEpisodes:
            anilistData.episodes,

        duration:
            anilistData.duration,

        status:
            anilistData.status,

        format:
            anilistData.format,

        season:
            anilistData.season,

        seasonYear:
            anilistData.seasonYear,

        averageScore:
            anilistData.averageScore,

        meanScore:
            anilistData.meanScore,

        popularity:
            anilistData.popularity,

        favourites:
            anilistData.favourites,

        genres:
            anilistData.genres || [],

        synonyms:
            anilistData.synonyms || [],

        source:
            anilistData.source,

        studios:
            anilistData.studios?.nodes || [],

        mainStudio:
            anilistData.studios?.nodes?.[0]
                ?.name || null,

        // =====================
        // TRAILER
        // =====================
        trailer: anilistData.trailer
            ? {
                id:
                    anilistData.trailer.id,

                site:
                    anilistData.trailer.site,

                thumbnail:
                    anilistData.trailer
                        .thumbnail,

                url:
                    anilistData.trailer.site?.toLowerCase() ===
                        "youtube"
                        ? `https://www.youtube.com/watch?v=${anilistData.trailer.id}`
                        : null,

                embedUrl:
                    anilistData.trailer.site?.toLowerCase() ===
                        "youtube"
                        ? `https://www.youtube.com/embed/${anilistData.trailer.id}`
                        : null
            }
            : null,

        nextAiringEpisode:
            anilistData.nextAiringEpisode,

        // =====================
        // GLOBAL RANK
        // =====================
        globalRank:
            globalRank?.rank || null,

        popularityRank:
            popularityRank?.rank ||
            null,

        rankings:
            anilistData.rankings || [],

        // =====================
        // RELATIONS
        // =====================
        relations:
            anilistData.relations?.edges?.map(
                relation => ({
                    relationType:
                        relation.relationType,

                    id:
                        relation.node.id,

                    mediaType:
                        relation.node.type,

                    title: {
                        romaji:
                            relation.node.title
                                .romaji,

                        english:
                            relation.node.title
                                .english
                    },
                    format:
                        relation.node.format,

                    cover:
                        relation.node
                            .coverImage
                            .medium
                })
            ) || [],

        // =====================
        // CHARACTERS + SEIYUU
        // =====================
        characters:
            anilistData.characters?.edges?.map(
                character => ({
                    role:
                        character.role,

                    character: {
                        id:
                            character.node
                                .id,

                        name:
                            character.node
                                .name
                                .full,

                        image:
                            character.node
                                .image
                                .large
                    },

                    seiyuu:
                        character
                            .voiceActors?.[0]
                            ? {
                                id:
                                    character
                                        .voiceActors[0]
                                        .id,

                                name:
                                    character
                                        .voiceActors[0]
                                        .name
                                        .full,

                                nativeName:
                                    character
                                        .voiceActors[0]
                                        .name
                                        .native,

                                image:
                                    character
                                        .voiceActors[0]
                                        .image
                                        .large
                            }
                            : null
                })
            ) || [],

        // =====================
        // TAGS
        // =====================
        tags:
            anilistData.tags?.map(
                tag => ({
                    name:
                        tag.name,

                    rank:
                        tag.rank
                })
            ) || [],

        // =====================
        // STREAMING EPISODES
        // =====================
        episodes:
            samehadaData.episodeList?.map(
                ep => ({
                    title: `Episode ${ep.title}`,
                    slug: ep.episodeId
                })
            ) || []
    };
}