const { chromium } = require("playwright");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/cookie", async (req, res) => {
  const { url, username, password } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL parameter" });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Aller sur la page de login si username/password fournis
    if (username && password) {
      await page.goto(url);

      // À adapter selon le formulaire du site
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');

      // Attendre que la navigation après login soit terminée
      await page.waitForNavigation();
    } else {
      await page.goto(url);
    }

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
