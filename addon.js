const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;

const manifest = {
  id: "com.nuvio.latino.addon",
  version: "1.0.0",
  name: "Nuvio Latino",
  description: "Proveedores de películas y series en español latino",
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nuvio Latino iniciado en puerto ${PORT}`);
});
