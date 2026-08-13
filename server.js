const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const CryptoJS = require("crypto-js");

const app = express();
app.use(cors());

// ==========================================
// CONFIGURACIÓN
// ==========================================
const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const BASE_URL = "https://allpeliculas.la";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const HEADERS = { "User-Agent": USER_AGENT, "Accept": "application/json, text/plain, */*", "Connection": "keep-alive" };

// ==========================================
// FUNCIONES DE SCRAPING (Importadas de tu código)
// ==========================================
function cleanTitle(title) { /* Tu código original */ }
function getSearchQuery(title) { /* Tu código original */ }
async function getTMDBInfo(id, type) { /* Tu código original */ }
async function searchAllPeliculas(query, type) { /* Tu código original */ }
function isMirror(url, group) { /* Tu código original */ }
function unpackEval(payload, radix, symtab) { /* Tu código original */ }
function evalUnpack(script) { /* Tu código original */ }
function localAtob(input) { /* Tu código original */ }
async function resolveStreamwish(embedUrl) { /* Tu código original */ }
async function resolveVidhide(embedUrl) { /* Tu código original */ }
function aesGcmDecrypt(playback) { /* Tu código original */ }
async function resolveFilemoon(embedUrl) { /* Tu código original */ }
async function resolveDoodstream(embedUrl) { /* Tu código original */ }
async function resolveStreamtape(embedUrl) { /* Tu código original */ }
async function resolveWaaw(embedUrl) { /* Tu código original */ }
async function resolveVoe(embedUrl) { /* Tu código original */ }
async function resolveOkRu(embedUrl) { /* Tu código original */ }
async function resolveVimeos(embedUrl) { /* Tu código original */ }
async function resolveGoodstream(embedUrl) { /* Tu código original */ }
async function resolveEmbed(url) { /* Tu código original */ }

// ==========================================
// FUNCIÓN PRINCIPAL DE STREAMS
// ==========================================
async function getStreams(id, type, season, episode) {
    console.log(`[DEBUG] Buscando: ID=${id}, Type=${type}`);
    
    const info = await getTMDBInfo(id, type);
    if (!info) return [];

    let matchedPost = null;
    for (const title of info.titles) {
        const query = getSearchQuery(title);
        const posts = await searchAllPeliculas(query, type);
        if (posts && posts.length > 0) {
            const matchesType = (type === "series" || type === "tv") ? "tvshows" : "movies";
            matchedPost = posts.find(p => p.type === matchesType && (cleanTitle(p.title).includes(cleanTitle(title)) || cleanTitle(title).includes(cleanTitle(p.title))));
            if (matchedPost) break;
            matchedPost = posts.find(p => p.type === matchesType);
            if (matchedPost) break;
        }
    }

    if (!matchedPost) return [];

    let targetPostId = matchedPost.id;
    if (type === "series" || type === "tv") {
        const seasonUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${matchedPost.id}&season=${season}&postsPerPage=100&page=1`;
        const epRes = await fetch(seasonUrl, { headers: HEADERS });
        const epData = await epRes.json();
        const epMatched = epData?.data?.posts?.find(ep => parseInt(ep.season_number) === parseInt(season) && parseInt(ep.episode_number) === parseInt(episode));
        if (!epMatched) return [];
        targetPostId = epMatched._id;
    }

    const playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${targetPostId}&demo=0`;
    const pRes = await fetch(playerUrl, { headers: HEADERS });
    const pData = await pRes.json();
    
    if (!pData?.data?.embeds) return [];

    const streams = [];
    for (const embed of pData.data.embeds) {
        if (embed.server === "Torrent" || !embed.url?.startsWith("http")) continue;
        
        const resolved = await resolveEmbed(embed.url);
        if (resolved?.url) {
            let lang = "Lat";
            if (embed.lang?.includes("Castellano")) lang = "Esp";
            else if (embed.lang?.includes("Subtitulado")) lang = "Sub";
            
            streams.push({
                name: "AllpeliculasSE",
                title: `${resolved.quality || "1080p"} · ${lang} · ${resolved.server}`,
                url: resolved.url,
                headers: resolved.headers || { Referer: embed.url }
            });
        }
    }
    return streams;
}

// ==========================================
// RUTAS DEL SERVIDOR EXPRESS
// ==========================================
app.get('/manifest.json', (req, res) => {
    res.json({
        id: "allpeliculas.latino",
        version: "1.0.0",
        name: "AllPeliculas Latino",
        resources: ["stream"],
        types: ["movie", "series"],
        idPrefixes: ["tt", "tmdb:"]
    });
});

app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    let cleanId = id.includes(":") ? id.split(":")[1] : id;
    const season = req.query.season ? parseInt(req.query.season) : null;
    const episode = req.query.episode ? parseInt(req.query.episode) : null;
    
    try {
        const streams = await getStreams(cleanId, type, season, episode);
        res.json({ streams });
    } catch (e) {
        console.error("Error:", e);
        res.json({ streams: [] });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
