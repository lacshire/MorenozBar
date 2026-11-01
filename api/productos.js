// Busca en la raíz del repo cualquier .json con una lista de productos,
// sin importar cómo se llame, y lo devuelve a la web.
const fs = require("fs");
const path = require("path");

const IGNORAR = /^(vercel|package|package-lock|tsconfig|jsconfig)\.json$/i;

module.exports = (req, res) => {
  const dirs = [...new Set([process.cwd(), path.join(__dirname, "..")])];
  for (const dir of dirs) {
    let archivos = [];
    try {
      archivos = fs.readdirSync(dir)
        .filter((f) => /\.json$/i.test(f) && !IGNORAR.test(f))
        .sort();
    } catch (e) {}
    for (const f of archivos) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
        const lista = Array.isArray(d) ? d : d && d.products;
        if (Array.isArray(lista) && lista.length) {
          res.setHeader("Cache-Control", "no-cache");
          res.status(200).json({ file: f, products: lista });
          return;
        }
      } catch (e) {}
    }
  }
  res.status(404).json({ error: "No se encontró un JSON de productos" });
};
