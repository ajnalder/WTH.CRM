const addedFlag = "data-promo-extension-added";
const buttonClass = "promo-extension-button";
const config = window.PROMO_PICKER_CONFIG || {};

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

async function sendToPromo(product) {
  if (!config.convexSiteUrl || !config.clientId || !config.token || !config.promotionId) {
    throw new Error("Extension is not configured yet.");
  }
  const response = await fetch(`${config.convexSiteUrl}/promo/extension-add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: config.clientId,
      token: config.token,
      promotionId: config.promotionId,
      product,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to add product");
  }
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.zIndex = "999999";
  toast.style.bottom = "24px";
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

async function handleAdd(url) {
  const handle = extractHandle(url);
  if (!handle) {
    showToast("Product handle not found", true);
    return;
  }

  try {
    const data = await fetchProductJson(handle);
    const product = buildPayloadFromJson(data);
    await sendToPromo(product);
    showToast("Added to promo");
  } catch (error) {
    showToast(error.message || "Failed to add", true);
  }
}

function addButtonToLink(link) {
  const parent = link.closest("li, article, div") || link.parentElement;
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
  const links = Array.from(document.querySelectorAll("a[href*=\"/products/\"]"));
  links.forEach(addButtonToLink);
}

function addProductPageButton() {
  const handle = extractHandle(window.location.href);
  if (!handle) return;
  if (document.querySelector(`.${buttonClass}.promo-floating`)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = `${buttonClass} promo-floating`;
  button.textContent = "Add to promo";
  button.addEventListener("click", () => handleAdd(window.location.href));
  document.body.appendChild(button);
}

addButtons();
addProductPageButton();

const observer = new MutationObserver(() => {
  addButtons();
});

observer.observe(document.body, { childList: true, subtree: true });
