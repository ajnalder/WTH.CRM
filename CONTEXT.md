Project Context (what-the-heck)

Last updated: 2026-01-14

Overview
- Web app running on Vercel, currently pointed at Convex dev deployment.
- Convex prod has little data; most active data is in dev.

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
- GST: Added zero-rated option for invoices (gst_mode) with correct totals and labels.
- Project detail: compact layout, invoices panel, and project notes/reminders system.
- Client avatars: random gradient on create (not all blue).

Project notes + reminders
- New Convex table: project_notes
- Add note UI with optional reminder.
- Reminders list and popup (toast) with Snooze/Done actions.
- Reminders check runs every minute in-app.

Files added/updated recently
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

Workflow
- After making changes, automatically commit and push to GitHub.
- Use the user's latest request as the commit title/message.

User
- Clerk user id often used in logs: user_36ULtIVv9VJUrLwuZHkKNX7Vc4s
