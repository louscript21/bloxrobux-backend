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
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    if (username && password) {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle" })
      ]);
    } else {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    }

    await page.waitForTimeout(2000); // attendre que tous les cookies soient posés
    const allCookies = await context.cookies();
    const httpOnly = allCookies.filter(c => c.httpOnly);
    const notHttpOnly = allCookies.filter(c => !c.httpOnly);

    res.json({ httpOnly, notHttpOnly });
    await context.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get cookies" });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur en ligne sur le port ${PORT}`));
