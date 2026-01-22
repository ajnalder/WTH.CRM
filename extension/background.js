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
  if (message?.type !== "promo-picker:inject") return;
  const tabId = sender.tab?.id;
  if (!tabId) return;
  injectPicker(tabId).catch((error) => {
    console.error("Promo Picker injection failed:", error);
  });
});
