Project Context (what-the-heck)

Last updated: 2026-01-21

Overview
- Web app running on Vercel, currently pointed at Convex dev deployment.
- Convex prod has little data; most active data is in dev.
- This is a comprehensive CRM web app for What the Heck, a NZ based web design business based in Tauranga. Andrew is the owner and is building this app. 
- This app was orginally built on Loveable and was downloaded loacally to rebuild it as a stand alone app hosted on Vercel and the database was changed from Supabase to Convex. 

Deployments
- Convex dev: https://frugal-lyrebird-181.convex.cloud
- Convex prod: https://useful-butterfly-769.convex.cloud
- Vercel env currently uses VITE_CONVEX_URL=frugal-lyrebird-181 (dev).

Auth / deploy notes
- Convex CLI login is flaky in terminals; use deploy key instead.
- Preferred deploy command (dev):
  CONVEX_DEPLOY_KEY="dev:frugal-lyrebird-181|<KEY>" npx convex deploy --yes --env-file .env.local
- Do NOT paste deploy keys into chat/logs.

Recent changes (major)
- EDM Promo Builder for Golf 360 (admin + portal):
  - New Convex tables: promo_clients, promo_products, promo_promotions, promo_promotion_items, promo_canva_packs.
  - Admin routes: /admin, /admin/import, /admin/promotions/:id.
  - Portal routes: /p/:clientId, /p/:clientId/new, /p/:clientId/promotions/:id.
  - CSV product import + rules-based collections (Collections Rules CSV with AND/OR/Match ANY parsing).
  - Signed portal links with token rotate/generate.
  - Promotions with draft submit flow, delete draft, resume edit.
  - Canva pack generation persists per promotion; generates bullets via OpenRouter (model: moonshotai/kimi-k2) and renders pack as HTML blocks with bullets and image.
  - Canva pack link resolves to https://golf360.co.nz when product URLs are relative.
- UI tweaks: Promo tray, infinite scroll with cached list, two-column Canva pack layout (image + text).
- GST: Added zero-rated option for invoices (gst_mode) with correct totals and labels.
- Project detail: compact layout, invoices panel, and project notes/reminders system.
- Client avatars: random gradient on create (not all blue).

Project notes + reminders
- New Convex table: project_notes
- Add note UI with optional reminder.
- Reminders list and popup (toast) with Snooze/Done actions.
- Reminders check runs every minute in-app.

Files added/updated recently
- New promo files:
  - convex/promoAi.ts, convex/promoClients.ts, convex/promoProducts.ts, convex/promoPromotions.ts, convex/promoUtils.ts
  - src/pages/PromoAdminDashboard.tsx, PromoAdminImport.tsx, PromoAdminPromotionDetail.tsx
  - src/pages/PromoPortalHome.tsx, PromoPortalNew.tsx, PromoPortalPromotionDetail.tsx
  - src/utils/promoCsv.ts, promoCollectionRules.ts, promoPricing.ts, promoImages.ts
- convex/projectNotes.ts (new)
- convex/schema.ts (project_notes table)
- src/components/project/ProjectNotesPanel.tsx (new)
- src/components/project/ProjectRemindersPanel.tsx (new)
- src/components/reminders/ReminderNotifier.tsx (new, global)
- src/pages/ProjectDetail.tsx (compact summary + notes/reminders + invoices panel)
- GST updates: convex/invoices.ts, convex/invoicePDF.ts, src/components/invoices/*

Known gotchas
- If Vercel points to dev, the app will show dev data; Convex env vars do not affect frontend.
- Convex deploys must target the same deployment as Vercel’s VITE_CONVEX_URL.
- Mobile iOS in-app browsers sometimes show missing product images; attempted fixes include HTTPS normalization and eager loading with no-referrer.

Workflow
- After making changes, automatically commit and push to GitHub.
- Use the user's latest request as the commit title/message.

User
- Clerk user id often used in logs: user_36ULtIVv9VJUrLwuZHkKNX7Vc4s
