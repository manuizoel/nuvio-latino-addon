// Este archivo conecta Render con tu addon real
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Importar tu addon desde la carpeta providers
// Como allpeliculasse.js usa export default, lo importamos así:
let addon;
try {
    // Si tu archivo en providers/ usa module.exports
    addon = require('./providers/allpeliculasse');
} catch (e) {
    // Si usa export default (ES6)
    const importDynamic = new Function('modulePath', 'return import(modulePath)');
    importDynamic('./providers/allpeliculasse.js').then(mod => {
        addon = mod.default || mod;
    });
}

// ==========================================
// RUTAS DEL SERVIDOR
// ==========================================
app.get('/manifest.json', (req, res) => {
    res.json({
        id: "allpeliculas.latino",
        version: "1.0.0",
        name: "AllPeliculas Latino",
        description: "Scraper de AllPeliculas para Nuvio",
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
    
    console.log(`[PETICIÓN] Tipo: ${type} | ID: ${cleanId} | Temp: ${season} | Epi: ${episode}`);
    
    try {
        // Asegurarnos de que el addon esté cargado
        if (!addon || !addon.getStreams) {
            console.log("Esperando a que el addon se cargue...");
            await new Promise(r => setTimeout(r, 1000));
        }
        
        const streams = await addon.getStreams(cleanId, type, season, episode);
        res.json({ streams: streams });
    } catch (error) {
        console.error("[ERROR]", error);
        res.json({ streams: [] });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor AllPeliculasSE corriendo en el puerto ${PORT}`);
});
