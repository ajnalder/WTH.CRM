const convexSiteUrlInput = document.getElementById("convexSiteUrl");
const clientIdInput = document.getElementById("clientId");
const tokenInput = document.getElementById("token");
const promotionIdInput = document.getElementById("promotionId");
const saveBtn = document.getElementById("saveBtn");
const portalFrame = document.getElementById("portalFrame");

const defaultConfig = window.PROMO_PICKER_CONFIG || {};

function buildPortalUrl(config) {
  if (!config.clientId || !config.token) return "";
  const base = `https://wth-crm.vercel.app/p/${config.clientId}`;
  const params = new URLSearchParams({ token: config.token });
  if (config.promotionId) {
    params.set("promotionId", config.promotionId);
  }
  return `${base}?${params.toString()}`;
}

async function loadConfig() {
  const stored = await chrome.storage.sync.get([
    "convexSiteUrl",
    "clientId",
    "token",
    "promotionId",
  ]);
  const config = {
    convexSiteUrl: stored.convexSiteUrl || defaultConfig.convexSiteUrl || "",
    clientId: stored.clientId || defaultConfig.clientId || "",
    token: stored.token || defaultConfig.token || "",
    promotionId: stored.promotionId || defaultConfig.promotionId || "",
  };
  convexSiteUrlInput.value = config.convexSiteUrl;
  clientIdInput.value = config.clientId;
  tokenInput.value = config.token;
  promotionIdInput.value = config.promotionId;
  const url = buildPortalUrl(config);
  if (url) {
    portalFrame.src = url;
  }
}

saveBtn.addEventListener("click", async () => {
  const config = {
    convexSiteUrl: convexSiteUrlInput.value.trim(),
    clientId: clientIdInput.value.trim(),
    token: tokenInput.value.trim(),
    promotionId: promotionIdInput.value.trim(),
  };
  await chrome.storage.sync.set(config);
  const url = buildPortalUrl(config);
  if (url) {
    portalFrame.src = url;
  }
});

loadConfig();
