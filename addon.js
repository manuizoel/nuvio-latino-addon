const express = require("express");
const provider = require("./providers/allpeliculasse.js");

const app = express();
const PORT = process.env.PORT || 10000;

const manifest = {
  id: "com.nuvio.latino.addon",
  version: "1.0.0",
  name: "Nuvio Latino",
  description: "Películas y series en español latino",
  resources: [
    {
      name: "stream",
      types: ["movie", "series"],
      idPrefixes: ["tt"]
    }
  ],
  types: ["movie", "series"],
  catalogs: [],
  behaviorHints: {
    configurable: false,
    configurationRequired: false
  }
};

app.get("/", (req, res) => {
  res.json({
    status: "online",
    addon: "Nuvio Latino"
  });
});

app.get("/manifest.json", (req, res) => {
  res.json(manifest);
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const { type, id } = req.params;

    let tmdbId = id;

    if (tmdbId.includes(":")) {
      tmdbId = tmdbId.split(":")[0];
    }

    let streams = [];

    if (typeof provider.getStreams === "function") {
      streams = await provider.getStreams(
        tmdbId,
        type === "series" ? "tv" : "movie"
      );
    }

    res.json({
      streams: Array.isArray(streams) ? streams : []
    });

  } catch (error) {
    console.error("Error obteniendo streams:", error);

    res.json({
      streams: []
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nuvio Latino funcionando en puerto ${PORT}`);
});
