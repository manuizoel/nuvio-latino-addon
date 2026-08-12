const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    name: "Latino Providers",
    version: "1.0.0"
  });
});

app.get("/manifest.json", (req, res) => {
  res.json({
    id: "com.latino.nuvio.providers",
    version: "1.0.0",
    name: "Latino Providers",
    description: "Proveedores de contenido latino para Nuvio",
    catalogs: [],
    resources: [
      {
        name: "stream",
        types: ["movie", "series"],
        idPrefixes: ["tt"]
      }
    ],
    types: ["movie", "series"],
    behaviorHints: {
      configurable: false,
      configurationRequired: false
    }
  });
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const { type, id } = req.params;

    console.log("Solicitud recibida:", type, id);

    res.json({
      streams: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      streams: []
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Latino Providers ejecutándose en puerto ${PORT}`);
});
