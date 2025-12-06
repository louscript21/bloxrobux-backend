import admin from "firebase-admin";
import axios from "axios";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: "https://bloxrobux-e9244-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.database();
const ROBLO_COOKIE = process.env.ROBLO_COOKIE; // ton cookie sécurisé

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, currencyAmount } = req.body;

  try {
    // Exemple : récupérer les serveurs privés de l'utilisateur
    const serversRes = await axios.get(
      "https://games.roblox.com/v1/private-servers/my-private-servers",
      { headers: { Cookie: `.ROBLOSECURITY=${ROBLO_COOKIE}` } }
    );

    console.log("Serveurs privés :", serversRes.data);

    // Mise à jour du solde dans Firebase
    const userRef = db.ref("users/" + userId + "/balance");
    const snapshot = await userRef.get();
    const current = snapshot.exists() ? snapshot.val() : 0;
    await userRef.set(current + Number(currencyAmount));

    res.status(200).json({ success: true, servers: serversRes.data });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
