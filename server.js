const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// URL du navigateur distant Browserless / Playwright Cloud
const REMOTE_BROWSER_WS = process.env.REMOTE_BROWSER_WS;

app.get("/api/cookie", async (req, res) => {
  const { url, username, password } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL parameter" });

  let browser;
  try {
    // Se connecter au navigateur distant
    browser = await chromium.connectOverCDP(REMOTE_BROWSER_WS);

    const context = await browser.newContext();
    const page = await context.newPage();

    // Login si credentials fournis
    if (username && password) {
      await page.goto(url);

      // Adapter selon le formulaire du site
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle" })
      ]);
    } else {
      await page.goto(url, { waitUntil: "networkidle" });
    }

    // Récupérer tous les cookies (HTTPOnly inclus)
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
