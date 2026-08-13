const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const BASE_URL = "https://allpeliculas.la";

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json, text/plain, */*"
};

/**
 * Limpia un título para poder compararlo
 * con los resultados de AllPeliculas.
 */
function cleanTitle(title) {
    if (!title) return "";

    return title
        .toLowerCase()
        .replace(/\(.*?\)/g, "")
        .replace(/\[.*?\]/g, "")
        .replace(/:\s*.*?$/g, "")
        .replace(/[-_]/g, " ")
        .replace(/[^\w\sáéíóúüñ]/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Obtiene información de TMDB.
 */
async function getTMDBInfo(id, type) {
    try {
        const endpoint = type === "tv" ? "tv" : "movie";

        const url =
            `https://api.themoviedb.org/3/${endpoint}/${id}` +
            `?api_key=${TMDB_API_KEY}` +
            `&language=es-MX`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": USER_AGENT
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        const title =
            type === "tv"
                ? data.name
                : data.title;

        const originalTitle =
            type === "tv"
                ? data.original_name
                : data.original_title;

        const year =
            type === "tv"
                ? (data.first_air_date || "").substring(0, 4)
                : (data.release_date || "").substring(0, 4);

        return {
            title,
            originalTitle,
            year
        };

    } catch (error) {
        console.log(
            `[AllPeliculas] TMDB error: ${error.message}`
        );

        return null;
    }
}

/**
 * Busca directamente en la API de AllPeliculas.
 */
async function searchAllPeliculas(query, type) {
    try {
        const postType =
            type === "tv"
                ? "tvshows"
                : "movies";

        const url =
            `${BASE_URL}/wp-api/v1/search` +
            `?filter=[]` +
            `&q=${encodeURIComponent(query)}` +
            `&orderBy=latest` +
            `&order=desc` +
            `&postType=${postType}` +
            `&postsPerPage=20` +
            `&page=1`;

        console.log(
            `[AllPeliculas] Buscando: ${query}`
        );

        const response = await fetch(url, {
            headers: HEADERS
        });

        if (!response.ok) {
            console.log(
                `[AllPeliculas] HTTP ${response.status}`
            );

            return [];
        }

        const data = await response.json();

        if (!data?.data?.posts) {
            return [];
        }

        return data.data.posts.map(post => ({
            id: post._id,
            title: post.title || "",
            slug: post.slug || "",
            type: post.type || ""
        }));

    } catch (error) {
        console.log(
            `[AllPeliculas] Search error: ${error.message}`
        );

        return [];
    }
}

/**
 * Encuentra el resultado que mejor coincide
 * con el título de TMDB.
 */
function findBestMatch(results, tmdbTitle, type) {
    if (!results?.length || !tmdbTitle) {
        return null;
    }

    const wanted = cleanTitle(tmdbTitle);

    const expectedType =
        type === "tv"
            ? "tvshows"
            : "movies";

    const validResults = results.filter(
        item => item.type === expectedType
    );

    if (!validResults.length) {
        return null;
    }

    // Coincidencia exacta
    const exact = validResults.find(
        item => cleanTitle(item.title) === wanted
    );

    if (exact) {
        return exact;
    }

    // Coincidencia parcial
    const partial = validResults.find(item => {
        const current = cleanTitle(item.title);

        return (
            current.includes(wanted) ||
            wanted.includes(current)
        );
    });

    return partial || validResults[0];
}

/**
 * Punto de entrada utilizado por el proveedor.
 *
 * Busca la película/serie en AllPeliculas
 * utilizando el ID de TMDB recibido por Nuvio.
 */
async function getStreams(id, type, season, episode) {
    console.log(
        `[AllPeliculas] TMDB ID=${id} TYPE=${type}`
    );

    const tmdb = await getTMDBInfo(id, type);

    if (!tmdb) {
        console.log(
            "[AllPeliculas] No se pudo obtener información de TMDB"
        );

        return [];
    }

    const queries = [];

    if (tmdb.title) {
        queries.push(tmdb.title);
    }

    if (
        tmdb.originalTitle &&
        tmdb.originalTitle !== tmdb.title
    ) {
        queries.push(tmdb.originalTitle);
    }

    for (const query of queries) {
        const results = await searchAllPeliculas(
            query,
            type
        );

        const match = findBestMatch(
            results,
            query,
            type
        );

        if (!match) {
            continue;
        }

        console.log(
            `[AllPeliculas] Encontrado: ${match.title}`
        );

        /**
         * Devuelve el resultado encontrado.
         *
         * La URL apunta a la página correspondiente
         * de AllPeliculas, no a un reproductor externo.
         */
        return [{
            name: "AllPeliculas",
            title: match.title,
            url: `${BASE_URL}/${match.slug}`,
            quality: "HD",
            language: "Lat"
        }];
    }

    console.log(
        "[AllPeliculas] No se encontró coincidencia."
    );

    return [];
}

module.exports = {
    getStreams
};
