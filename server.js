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
    // Lancer Chromium en headless (Render n'a pas de GUI)
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // Pour intercepter les cookies HTTP-only depuis les headers
    const httpOnlyCookies = [];
    context.on("page", page => {
      page.on("response", response => {
        const setCookie = response.headers()["set-cookie"];
        if (setCookie) {
          httpOnlyCookies.push(setCookie);
        }
      });
    });

    const page = await context.newPage();

    if (username && password) {
      await page.goto(url, { waitUntil: "networkidle" });

      // Adaptable selon le formulaire du site
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);

      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle" })
      ]);
    } else {
      await page.goto(url, { waitUntil: "networkidle" });
    }

    // Récupérer tous les cookies accessibles depuis JS
    const cookies = await context.cookies();

    res.json({ cookies, httpOnlyCookies });

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
