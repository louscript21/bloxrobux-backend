const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/cookie", async (req, res) => {
  const { url, username, password } = req.query;
  if (!url || !username || !password)
    return res.status(400).json({ error: "Missing parameters" });

  let browser;
  try {
    browser = await chromium.launch({ headless: false }); // headless: false pour voir ce qu'il se passe
    const context = await browser.newContext();
    const page = await context.newPage();

    // Aller sur la page de login
    await page.goto(url);

    // Remplir le formulaire (adapter les sélecteurs au site réel)
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle" })
    ]);

    // Récupérer tous les cookies après login
    const cookies = await context.cookies();

    res.json({ cookies });

    await context.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get cookies" });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
