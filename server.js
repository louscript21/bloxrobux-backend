const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// URL du navigateur remote (par exemple Browserless ou Playwright Cloud)
const REMOTE_BROWSER_WS = process.env.REMOTE_BROWSER_WS;

app.get("/api/cookie", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing URL parameter" });

  let browser;
  try {
    // Se connecter au navigateur distant
    browser = await chromium.connectOverCDP(REMOTE_BROWSER_WS);

    const context = await browser.newContext();
    const page = await context.newPage();

    // Aller sur le site
    await page.goto(url);

    // Récupérer tous les cookies
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

