const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" })); // ← AVANT les routes

app.post("/api/receive-cookies", (req, res) => {
  if (req.headers.authorization !== "Bearer SUPER_SECRET_TOKEN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("Cookies reçus :", req.body.length);
  console.log(
    req.body.map(c => ({
      name: c.name,
      httpOnly: c.httpOnly,
      domain: c.domain
    }))
  );

  res.json({ ok: true });
});

app.listen(10000, () => {
  console.log("✅ Serveur en ligne sur le port 10000");
});
