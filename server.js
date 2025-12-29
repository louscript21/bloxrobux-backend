const { chromium } = require("playwright");

(async () => {
  console.log("🚀 Lancement du navigateur...");

  const browser = await chromium.launch({
    headless: true, // mets false pour voir le navigateur
    slowMo: 50
  });

  // Contexte = session navigateur (cookies, localStorage, etc.)
  const context = await browser.newContext();

  const page = await context.newPage();

  console.log("🌍 Ouverture de Wikipédia...");
  await page.goto("https://fr.wikipedia.org", {
    waitUntil: "networkidle"
  });

  // Tentative d'acceptation des cookies (si le bouton existe)
  try {
    await page.click('button:has-text("Tout accepter")', { timeout: 3000 });
    console.log("✅ Cookies acceptés");
  } catch {
    console.log("ℹ️ Pas de bannière cookies détectée");
  }

  // Récupération des cookies
  const cookies = await context.cookies();

  console.log("\n🍪 Cookies récupérés :\n");
  cookies.forEach(cookie => {
    console.log(
      `Nom: ${cookie.name}\n` +
      `Valeur: ${cookie.value}\n` +
      `Domaine: ${cookie.domain}\n` +
      `Path: ${cookie.path}\n` +
      `Secure: ${cookie.secure}\n` +
      `HttpOnly: ${cookie.httpOnly}\n` +
      "-----------------------------"
    );
  });

  // Sauvegarde des cookies pour réutilisation
  await context.storageState({ path: "cookies.json" });
  console.log("\n💾 Cookies sauvegardés dans cookies.json");

  await browser.close();
  console.log("🛑 Navigateur fermé");
})();

