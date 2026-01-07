# Supabase -> Convex migration notes

## What currently relies on Supabase
- **Auth**: Email/password auth handled in `src/contexts/AuthContext.tsx` (session state, onAuthStateChange, signInWithPassword, signOut). Supabase session is also sent to Edge Functions through `supabase.functions.invoke`.
- **Database tables (public)**: `campaign_sends`, `checklist_templates`, `client_checklists`, `clients`, `company_settings`, `contacts`, `domains`, `email_campaigns`, `email_images`, `email_logs`, `email_templates`, `hosting`, `ideas`, `invoice_items`, `invoice_payments`, `invoices`, `profiles`, `project_team_members`, `projects`, `quote_blocks`, `quote_events`, `quote_items`, `quote_templates`, `quotes`, `task_files`, `task_planning`, `tasks`, `time_entries`, `time_slots`, `xero_oauth_states`, `xero_tokens`.
- **Storage buckets**: `email-images` (quote cover images and email assets), `task-files` (task attachments). Files are uploaded and public URLs are read directly from Supabase storage.
- **Edge Functions invoked from the app**: `xero-oauth`, `xero-oauth-callback`, `xero-sync` (Xero integration), `send-invoice-email`, `send-quote-notification`, `send-email-campaign`, `parse-voice-command` (OpenAI). Called via `supabase.functions.invoke` in hooks/components such as `useXeroIntegration`, `useEmailInvoice`, `useVoiceCommands`, and `QuoteBuilder/PublicQuoteView`.
- **React data layer**: Dozens of React Query hooks call `supabase.from(...)` for CRUD, joins, and filters. Storage reads/writes happen in `useTaskFiles`, `useEmailImages`, and `QuoteHeader`.

## Migration approach
1. **Convex plumbing (done here)**: Convex client/provider wired up in `src/main.tsx` with `convexClient` (config via `VITE_CONVEX_URL`). App still runs without Convex until the URL is provided.
2. **Choose auth path**: Pick a Convex-supported auth provider (Convex Auth, Auth0, Clerk, etc.). Replace Supabase session handling in `AuthContext` with Convex auth hooks and expose the Convex auth token to actions that call external APIs.
3. **Model schema**: Create `convex/schema.ts` covering the tables above. Start with core entities (`profiles`, `clients`, `projects`, `tasks`, `time_entries`, `task_files`, `quotes`, `quote_items`, `quote_blocks`, `quote_events`, `invoices`, `invoice_items`, `invoice_payments`) and add indexes that match current query filters (user_id, client_id, project_id, task_id, status, date ranges).
4. **Port storage**: Move `email-images` and `task-files` usage to Convex file storage (`ctx.storage`), returning signed URLs from Convex queries. Update components/hooks (`QuoteHeader`, `useTaskFiles`, `useEmailImages`) to request/upload via Convex actions/mutations instead of direct bucket access.
5. **Rebuild data access**: For each Supabase hook, create Convex queries/mutations with validation. Keep the React Query keys but switch to `convex/react`’s `useQuery`/`useMutation` wrapping the generated `api` functions. Start with clients/projects/tasks/time_entries and then invoices/quotes/email marketing.
6. **Replace Edge Functions with Convex actions**: Move the Xero flows, email sending, voice parsing, and quote notifications into Convex actions. Ensure they enforce auth (e.g., `ctx.auth.getUserIdentity()`), handle secrets via Convex environment variables, and write to Convex tables for logging.
7. **Data migration**: Export Supabase data per table (or via a script) and import into Convex using `npx convex import` or custom actions. Verify relationships and derived fields (e.g., denormalized counts) after import.

Use this doc as the running checklist while we replace Supabase calls and storage with Convex equivalents.

## Latest progress
- Convex client/provider is wired into `src/main.tsx`.
- Draft Convex schema added at `convex/schema.ts` to mirror the Supabase tables (with indexes on common filters).
- Added Convex functions for core CRUD on clients, projects, tasks, and time entries (`convex/clients.ts`, `convex/projects.ts`, `convex/tasks.ts`, `convex/timeEntries.ts`), plus shared helpers.

## Immediate next steps
1. Set `VITE_CONVEX_URL` for your deployment, then run `npx convex dev` (or `npx convex codegen`) so the generated client picks up the schema.
2. Pick the Convex auth provider and start replacing `AuthContext` to use Convex auth primitives.
3. Port one slice (clients/projects/tasks/time_entries) to Convex queries/mutations and update the corresponding React Query hooks to use `convex/react`, now that the server-side functions exist.
