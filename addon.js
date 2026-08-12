const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

const manifest = {
  id: "com.nuvio.latino.addon",
  version: "1.0.0",
  name: "Nuvio Latino",
  description: "Addon Latino para Nuvio",
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
  console.log("Solicitud de stream:", req.params);

  res.json({
    streams: []
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
