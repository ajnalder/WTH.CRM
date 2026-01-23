const addedFlag = "data-promo-extension-added";
const buttonClass = "promo-extension-button";
const config = window.PROMO_PICKER_CONFIG || {};
const promoState = { active: false };
const productCardSelectors = [
  "[data-product-id]",
  "[data-product-handle]",
  ".product-card",
  ".product-item",
  ".grid__item",
  ".card",
  "li",
  "article",
];

function toText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
}

function extractHandle(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    const match = parsed.pathname.match(/\/products\/([^/?#]+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function fetchProductJson(handle) {
  const response = await fetch(`/products/${handle}.js`, { credentials: "omit" });
  if (!response.ok) throw new Error("Failed to fetch product JSON");
  return response.json();
}

function buildPayloadFromJson(data) {
  return {
    title: data.title,
    short_title: data.title.length > 60 ? data.title.slice(0, 60) : undefined,
    product_url: `${window.location.origin}/products/${data.handle}`,
    image_url: data.featured_image || (data.images && data.images[0]) || "",
    price: Number(data.price || 0) / 100,
    compare_at_price: data.compare_at_price ? Number(data.compare_at_price) / 100 : undefined,
    vendor: data.vendor || undefined,
    product_type: data.type || undefined,
    tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || undefined,
    description: toText(data.description || ""),
  };
}

async function sendToPromo(product, currentConfig) {
  if (
    !currentConfig.convexSiteUrl ||
    !currentConfig.clientId ||
    !currentConfig.token ||
    !currentConfig.promotionId
  ) {
    throw new Error("Extension is not configured yet.");
  }
  const response = await fetch(`${currentConfig.convexSiteUrl}/promo/extension-add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: currentConfig.clientId,
      token: currentConfig.token,
      promotionId: currentConfig.promotionId,
      product,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to add product");
  }
}

async function fetchPromotionStatus(currentConfig) {
  if (
    !currentConfig.convexSiteUrl ||
    !currentConfig.clientId ||
    !currentConfig.token ||
    !currentConfig.promotionId
  ) {
    return null;
  }
  const response = await fetch(
    `${currentConfig.convexSiteUrl}/promo/extension-status`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: currentConfig.clientId,
        token: currentConfig.token,
        promotionId: currentConfig.promotionId,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 404) return "missing";
    if (response.status === 401) return "invalid";
    return null;
  }

  const data = await response.json();
  return data?.status || null;
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.zIndex = "999999";
  toast.style.bottom = "160px";
  toast.style.right = "24px";
  toast.style.padding = "10px 14px";
  toast.style.background = isError ? "#ef4444" : "#111827";
  toast.style.color = "white";
  toast.style.borderRadius = "10px";
  toast.style.fontSize = "13px";
  toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function formatConfigHint(current) {
  const missing = [];
  if (!current.convexSiteUrl) missing.push("convexSiteUrl");
  if (!current.clientId) missing.push("clientId");
  if (!current.token) missing.push("token");
  if (!current.promotionId) missing.push("promotionId");
  return missing.length ? `Missing: ${missing.join(", ")}` : null;
}

function openPromoPortal(currentConfig, returnUrl) {
  if (!currentConfig.clientId || !currentConfig.token) return;
  const params = new URLSearchParams({ token: currentConfig.token });
  if (returnUrl) {
    params.set("returnUrl", returnUrl);
  }
  const url = `https://wth-crm.vercel.app/p/${currentConfig.clientId}/new?${params.toString()}`;
  chrome.runtime?.sendMessage({ type: "promo-picker:open-portal", url });
}

async function getConfig() {
  if (chrome?.storage?.sync) {
    const stored = await chrome.storage.sync.get([
      "convexSiteUrl",
      "clientId",
      "token",
      "promotionId",
    ]);
    return {
      convexSiteUrl: stored.convexSiteUrl || config.convexSiteUrl,
      clientId: stored.clientId || config.clientId,
      token: stored.token || config.token,
      promotionId: stored.promotionId || config.promotionId,
    };
  }
  return { ...config };
}

function clearAddButtons() {
  document.querySelectorAll(`.${buttonClass}`).forEach((node) => node.remove());
  const floating = document.getElementById("promo-picker-floating");
  if (floating) floating.remove();
  document.querySelectorAll(`[${addedFlag}]`).forEach((node) => {
    node.removeAttribute(addedFlag);
  });
}

function removeStartButton() {
  const startButton = document.getElementById("promo-picker-start");
  if (startButton) startButton.remove();
}

function addStartButton(currentConfig) {
  if (!currentConfig.clientId || !currentConfig.token) return;
  removeStartButton();
  const button = document.createElement("div");
  button.id = "promo-picker-start";
  button.textContent = "Start promo";
  button.style.all = "initial";
  button.style.position = "fixed";
  button.style.right = "24px";
  button.style.bottom = "140px";
  button.style.zIndex = "2147483647";
  button.style.background = "#0f172a";
  button.style.color = "#fff";
  button.style.padding = "10px 16px";
  button.style.borderRadius = "999px";
  button.style.fontFamily = "system-ui, -apple-system, sans-serif";
  button.style.fontSize = "13px";
  button.style.lineHeight = "1";
  button.style.cursor = "pointer";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.whiteSpace = "nowrap";
  button.style.height = "32px";
  button.style.minHeight = "32px";
  button.style.maxHeight = "32px";
  button.style.width = "auto";
  button.style.maxWidth = "220px";
  button.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
  button.style.boxSizing = "border-box";
  button.style.userSelect = "none";
  button.style.textDecoration = "none";
  button.style.transform = "none";
  button.style.writingMode = "horizontal-tb";
  button.style.textOrientation = "mixed";
  button.style.pointerEvents = "auto";
  button.setAttribute("role", "button");
  button.setAttribute("tabindex", "0");
  button.addEventListener("click", () =>
    openPromoPortal(currentConfig, window.location.href)
  );
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPromoPortal(currentConfig, window.location.href);
    }
  });
  document.body.appendChild(button);
}

async function handleAdd(url) {
  const handle = extractHandle(url);
  if (!handle) {
    showToast("Product handle not found", true);
    return;
  }

  try {
    const currentConfig = await getConfig();
    const configHint = formatConfigHint(currentConfig);
    if (configHint) {
      if (!currentConfig.promotionId) {
        openPromoPortal(currentConfig, window.location.href);
      }
      showToast(configHint, true);
      return;
    }
    if (!promoState.active) {
      openPromoPortal(currentConfig, window.location.href);
      showToast("Start a promo first", true);
      return;
    }
    const data = await fetchProductJson(handle);
    const product = buildPayloadFromJson(data);
    await sendToPromo(product, currentConfig);
    showToast("Added to promo");
  } catch (error) {
    const message =
      error?.message && error.message.length < 120
        ? error.message
        : "Failed to add";
    showToast(message, true);
  }
}

function addButtonToLink(link) {
  const parent =
    productCardSelectors
      .map((selector) => link.closest(selector))
      .find((node) => !!node) || link.parentElement;
  if (!parent || parent.getAttribute(addedFlag)) return;

  parent.setAttribute(addedFlag, "true");
  parent.style.position = "relative";

  const button = document.createElement("button");
  button.type = "button";
  button.className = buttonClass;
  button.textContent = "Add to promo";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleAdd(link.href);
  });

  parent.appendChild(button);
}

function addButtons() {
  if (!promoState.active) return;
  if (extractHandle(window.location.href)) {
    return;
  }
  const links = Array.from(document.querySelectorAll("a[href*=\"/products/\"]"));
  links.forEach(addButtonToLink);
}

function addProductPageButton() {
  if (!promoState.active) return;
  const handle = extractHandle(window.location.href);
  if (!handle) return;
  document.querySelectorAll(`.${buttonClass}`).forEach((node) => node.remove());
  const existingFloating = document.getElementById("promo-picker-floating");
  if (existingFloating) existingFloating.remove();

  const button = document.createElement("div");
  button.id = "promo-picker-floating";
  button.textContent = "Add to promo";
  button.style.all = "initial";
  button.style.position = "fixed";
  button.style.right = "24px";
  button.style.bottom = "110px";
  button.style.zIndex = "2147483647";
  button.style.background = "#111827";
  button.style.color = "#fff";
  button.style.padding = "10px 16px";
  button.style.borderRadius = "999px";
  button.style.fontFamily = "system-ui, -apple-system, sans-serif";
  button.style.fontSize = "13px";
  button.style.lineHeight = "1";
  button.style.cursor = "pointer";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.whiteSpace = "nowrap";
  button.style.height = "32px";
  button.style.minHeight = "32px";
  button.style.maxHeight = "32px";
  button.style.width = "auto";
  button.style.maxWidth = "220px";
  button.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
  button.style.boxSizing = "border-box";
  button.style.userSelect = "none";
  button.style.textDecoration = "none";
  button.style.transform = "none";
  button.style.writingMode = "horizontal-tb";
  button.style.textOrientation = "mixed";
  button.style.pointerEvents = "auto";
  button.setAttribute("role", "button");
  button.setAttribute("tabindex", "0");
  button.addEventListener("click", () => handleAdd(window.location.href));
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAdd(window.location.href);
    }
  });
  document.body.appendChild(button);
}

async function refreshPromotionState() {
  const currentConfig = await getConfig();
  if (!currentConfig.promotionId) {
    promoState.active = false;
    clearAddButtons();
    addStartButton(currentConfig);
    return;
  }
  const status = await fetchPromotionStatus(currentConfig);
  if (status && status !== "draft") {
    promoState.active = false;
    if (chrome?.storage?.sync) {
      await chrome.storage.sync.set({ promotionId: "" });
    }
    clearAddButtons();
    addStartButton(currentConfig);
    return;
  }

  promoState.active = true;
  removeStartButton();
  addButtons();
  addProductPageButton();
}

refreshPromotionState();

const observer = new MutationObserver(() => {
  addButtons();
  addProductPageButton();
});

observer.observe(document.body, { childList: true, subtree: true });

setInterval(() => {
  refreshPromotionState();
}, 30000);
