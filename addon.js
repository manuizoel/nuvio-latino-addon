const express = require("express");
const peliculasflix = require("./providers/peliculasflix");

const app = express();
const PORT = process.env.PORT || 3000;

const manifest = {
  id: "com.latino.nuvio.addon",
  version: "1.0.0",
  name: "Latino Nuvio",
  description: "Proveedores latino para Nuvio",
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
    addon: "Latino Nuvio"
  });
});

app.get("/manifest.json", (req, res) => {
  res.json(manifest);
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const { type, id } = req.params;

    console.log(`Solicitud: ${type} ${id}`);

    const streams = await peliculasflix.getStreams(
      id,
      type
    );

    res.json({
      streams: Array.isArray(streams) ? streams : []
    });

  } catch (error) {
    console.error("Error del proveedor:", error);

    res.json({
      streams: []
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Latino Nuvio iniciado en puerto ${PORT}`);
});
