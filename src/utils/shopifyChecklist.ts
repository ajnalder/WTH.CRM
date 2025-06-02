
export const shopifyChecklistItems = [
  // 1. General Settings
  { id: "1-1", title: "Business information set", description: "Business information set (name, address, email, phone)" },
  { id: "1-2", title: "Store currency set correctly", description: "Store currency set correctly" },
  { id: "1-3", title: "Timezone and standards set", description: "Timezone and standards (date, time, weights, units) set for NZ/AU or your client region" },
  { id: "1-4", title: "Customer notifications tested", description: "Customer notifications tested (order, shipping, etc)" },

  // 2. Domains
  { id: "2-1", title: "Primary domain set and connected", description: "Primary domain set and connected (SSL enabled)" },
  { id: "2-2", title: "All domains redirect to primary", description: "All domains redirect to primary domain (no www/non-www issues)" },
  { id: "2-3", title: "Test domain works", description: "Test domain works without redirect issues" },

  // 3. Theme & Branding
  { id: "3-1", title: "Main theme installed and updated", description: "Main theme installed and updated" },
  { id: "3-2", title: "Unused themes removed", description: "Unused themes removed" },
  { id: "3-3", title: "Favicon uploaded", description: "Favicon uploaded" },
  { id: "3-4", title: "Brand elements set", description: "Brand colours, logo, fonts set" },
  { id: "3-5", title: "Responsiveness checked", description: "Check all devices for responsiveness (desktop, tablet, mobile)" },
  { id: "3-6", title: "Header/footer checked", description: "Check header/footer, navigation, and main menu" },

  // 4. Pages & Content
  { id: "4-1", title: "Home page content loaded", description: "Home page copy, banners, and imagery loaded and checked" },
  { id: "4-2", title: "Essential pages live", description: "About, Contact, FAQ, Returns, Privacy, Shipping, and T&Cs pages live" },
  { id: "4-3", title: "Contact forms tested", description: "Contact form(s) tested and routing to correct email" },
  { id: "4-4", title: "Meta titles and descriptions", description: "Meta titles and descriptions for all main pages" },

  // 5. Products
  { id: "5-1", title: "Products imported and checked", description: "Products imported and checked (descriptions, prices, variants, images)" },
  { id: "5-2", title: "Product organization set up", description: "Product tags, types, collections all set up correctly" },
  { id: "5-3", title: "Inventory and SKUs checked", description: "Check inventory levels and SKUs" },
  { id: "5-4", title: "Product visibility correct", description: "Product visibility correct (published/unpublished as needed)" },
  { id: "5-5", title: "Product functionality tested", description: "Test Add to Cart, quantity selectors, variant pickers" },

  // 6. Collections & Navigation
  { id: "6-1", title: "Collections set up", description: "Main collections and featured categories set" },
  { id: "6-2", title: "Navigation tested", description: "Navigation and menus all linked and tested" },
  { id: "6-3", title: "Breadcrumbs working", description: "Breadcrumbs working if in theme" },

  // 7. Payments
  { id: "7-1", title: "Payment gateways set up", description: "Payment gateways set up and tested (Shopify Payments, Afterpay, PayPal, etc)" },
  { id: "7-2", title: "Test transaction processed", description: "Test transaction processed and refunded" },
  { id: "7-3", title: "Fraud prevention reviewed", description: "Fraud prevention and manual payment options reviewed" },

  // 8. Shipping & Taxes
  { id: "8-1", title: "Shipping rates configured", description: "Shipping rates and zones configured and tested (including free shipping promos)" },
  { id: "8-2", title: "Shipping tested at checkout", description: "Test shipping at checkout with different postcodes/regions" },
  { id: "8-3", title: "Tax settings checked", description: "Tax settings checked for NZ GST (or client region)" },
  { id: "8-4", title: "GST numbers on invoices", description: "GST numbers displayed on invoices/emails if needed" },

  // 9. Legal & Compliance
  { id: "9-1", title: "Legal policies published", description: "Privacy Policy, T&Cs, Returns/Refund, and Shipping policies all written and published" },
  { id: "9-2", title: "Cookie consent enabled", description: "Cookie consent/banner enabled" },
  { id: "9-3", title: "Age verification", description: "Age verification (if required for the client niche)" },
  { id: "9-4", title: "Accessibility basics checked", description: "Accessibility basics checked" },

  // 10. SEO & Analytics
  { id: "10-1", title: "Meta tags set", description: "Meta titles and descriptions set for all pages, products, collections" },
  { id: "10-2", title: "Image alt text", description: "Image alt text on all images" },
  { id: "10-3", title: "Clean URLs checked", description: "Check URLs are clean and human-friendly" },
  { id: "10-4", title: "301 redirects set up", description: "301 redirects set up from any old URLs" },
  { id: "10-5", title: "Google Analytics connected", description: "Google Analytics/GA4 connected and tested" },
  { id: "10-6", title: "Google Search Console setup", description: "Google Search Console setup" },
  { id: "10-7", title: "Tracking scripts tested", description: "Facebook Pixel, Klaviyo, and other tracking scripts tested" },
  { id: "10-8", title: "Sitemap and robots.txt", description: "Sitemap.xml and robots.txt checked" },

  // 11. Email & Notifications
  { id: "11-1", title: "Notification emails branded", description: "Customer notification emails branded and edited (order confirmation, shipping, etc)" },
  { id: "11-2", title: "Abandoned cart emails tested", description: "Abandoned cart emails tested" },
  { id: "11-3", title: "Transactional emails routing", description: "Transactional emails routing to the right inbox" },
  { id: "11-4", title: "Newsletter sign-up tested", description: "Newsletter sign-up forms tested and integrated" },

  // 12. Apps & Integrations
  { id: "12-1", title: "Required apps configured", description: "All required apps installed and configured" },
  { id: "12-2", title: "App functions tested", description: "Test each key app function (email, reviews, loyalty, etc)" },
  { id: "12-3", title: "Unused apps removed", description: "Unused demo or trial apps removed" },

  // 13. Checkout
  { id: "13-1", title: "Checkout tested", description: "Test guest and customer checkout" },
  { id: "13-2", title: "Discount codes tested", description: "Test discount codes (fixed, percentage, shipping, etc)" },
  { id: "13-3", title: "Payment methods tested", description: "Test various payment methods and error handling" },
  { id: "13-4", title: "Upsell logic reviewed", description: "Review upsell/cross-sell logic if used" },

  // 14. Operational
  { id: "14-1", title: "Staff accounts set up", description: "Staff accounts set up with correct permissions" },
  { id: "14-2", title: "Order notifications set", description: "Order notification emails/Slack integrations set" },
  { id: "14-3", title: "Templates tested", description: "Packing slips, invoice templates tested" },
  { id: "14-4", title: "Fulfilment settings checked", description: "Warehouse or fulfilment settings checked" },

  // 15. Launch & Post-launch
  { id: "15-1", title: "Store password removed", description: "Store password protection removed (when ready to go live)" },
  { id: "15-2", title: "Launch announced", description: "Announce launch via EDM/socials" },
  { id: "15-3", title: "Monitor first 48 hours", description: "Monitor orders and analytics for the first 48 hours" },
  { id: "15-4", title: "Plan post-launch review", description: "Plan post-launch review: bug check, feedback, and next steps" },

  // Optional (Advanced)
  { id: "16-1", title: "Custom scripts checked", description: "Custom scripts and Liquid code checked for errors" },
  { id: "16-2", title: "Accessibility audit", description: "Accessibility audit (contrast, alt text, screen reader test)" },
  { id: "16-3", title: "Store data backup", description: "Backup/export of store data" },
  { id: "16-4", title: "Performance test", description: "Mobile site speed and Google Lighthouse test" },
  { id: "16-5", title: "Monitoring set up", description: "Uptime and error monitoring set up" },
];
