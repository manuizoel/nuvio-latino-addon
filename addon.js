const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const manifest = {
  id: "com.latino.nuvio.addon",
  version: "1.0.0",
  name: "Latino Nuvio",
  description: "Addon de streams para Nuvio",
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
};

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    addon: "Latino Nuvio",
    version: "1.0.0"
  });
});

app.get("/manifest.json", (req, res) => {
  res.json(manifest);
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const { type, id } = req.params;

    console.log("Solicitud recibida:", {
      type,
      id
    });

    /*
     * Aquí se conectarán únicamente proveedores
     * autorizados para entregar los streams.
     */

    return res.json({
      streams: []
    });

  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      streams: []
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Addon Nuvio ejecutándose en puerto ${PORT}`);
});
