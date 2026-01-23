# Promo Picker Extension (PoC)

This is a proof of concept Chrome extension that lets a client add products from
the storefront directly into a promo.

## Setup

1. Open the extension popup and set:
   - `convexSiteUrl` (e.g. `https://frugal-lyrebird-181.convex.site`)
   - `clientId` (promo client id)
   - `token` (portal token)
   - `promotionId` (draft promotion id)
2. In Chrome, go to `chrome://extensions`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `extension/` folder.

## Usage

- Visit `https://www.golf360.co.nz`.
- Click the floating "Start promo" button (bottom right) to open the promo portal.
- Name the promo and save it. The extension stores the promotion ID automatically.
- Return to the storefront and the "Add to promo" buttons will appear.
- Click "Add to promo" on product cards or the floating button on product pages.
- The product is sent to the draft promotion.
- If you don't see the button, refresh the page.

## Troubleshooting

- If the extension icon is greyed out, open the extension menu and set
  "Site access" to "On all sites" or specifically allow `golf360.co.nz`.

## Notes

- The extension uses `/products/{handle}.js` for clean product data.
- Only the domains listed in `manifest.json` are supported.
