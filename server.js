const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Route POST pour recevoir les cookies
app.post("/api/receive-cookies", (req, res) => {
  if (req.headers.authorization !== "Bearer SUPER_SECRET_TOKEN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const cookies = req.body;

  console.log("Cookies reçus :", cookies.map(c => ({
    name: c.name,
    value: c.value,
    httpOnly: c.httpOnly,
    domain: c.domain
  })));

  res.json({ ok: true, received: cookies.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
