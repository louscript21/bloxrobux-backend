import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const ROBLO_COOKIE = process.env.ROBLO_COOKIE; // ton cookie Roblox sécurisé

// Endpoint pour récupérer les serveurs privés
app.get("/api/privateservers/:username", async (req, res) => {
  const robloxUsername = req.params.username;

  try {
    // 1️⃣ Récupérer l'ID Roblox
    const userRes = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      { usernames: [robloxUsername], excludeBannedUsers: true },
      { headers: { "Content-Type": "application/json" } }
    );

    const userId = userRes.data.data[0]?.id;
    if (!userId) return res.status(404).json({ error: "Utilisateur Roblox introuvable" });

    // 2️⃣ Récupérer les serveurs privés du compte lié au cookie
    const serversRes = await axios.get(
      "https://games.roblox.com/v1/private-servers/my-private-servers",
      { headers: { Cookie: `.ROBLOSECURITY=${ROBLO_COOKIE}` } }
    );

    res.json({ userId, servers: serversRes.data });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "Erreur récupération serveurs privés" });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend lancé sur le port ${PORT}`));
