chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["styles.css"],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["config.js", "contentScript.js"],
    });
  } catch (error) {
    console.error("Promo Picker injection failed:", error);
  }
});
