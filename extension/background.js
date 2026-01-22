async function injectPicker(tabId) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["styles.css"],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["config.js", "contentScript.js"],
  });
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === "promo-picker:open-portal") {
    if (message.url) {
      chrome.tabs.create({ url: message.url });
    }
    return;
  }
  if (message?.type !== "promo-picker:inject") return;
  const tabId = sender.tab?.id;
  if (!tabId) return;
  injectPicker(tabId).catch((error) => {
    console.error("Promo Picker injection failed:", error);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  const match = changeInfo.url.match(
    /^https:\/\/wth-crm\.vercel\.app\/p\/([^/]+)\/promotions\/([^/?#]+)/,
  );
  if (!match) return;
  const [, clientId, promotionId] = match;
  chrome.storage.sync.get(["clientId"]).then((stored) => {
    if (stored.clientId && stored.clientId !== clientId) return;
    chrome.storage.sync.set({ clientId, promotionId });
  });
});
