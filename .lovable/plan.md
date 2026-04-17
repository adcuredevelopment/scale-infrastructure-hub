
The user wants automatic Revolut sync instead of manually clicking the "Sync Revolut" button on the Overview page.

Looking at the existing setup:
- `revolut-sync-orders` edge function already exists and is invoked manually via `supabase.functions.invoke("revolut-sync-orders")`
- There's a `useAutoRefresh` hook that polls every 30s for dashboard data
- `expire-pending-payments` already exists as a scheduled function pattern

Two approaches: (A) client-side auto-sync while admin tab is open, (B) server-side cron via pg_cron every N minutes. Best practice is server-side cron — it runs even when no admin is logged in, keeps data fresh for webhooks/edge cases, and is the standard Lovable pattern documented in `<schedule-jobs-supabase-edge-functions>`.

I'll combine both: cron for background freshness + a subtle UI toggle so the admin can also enable in-tab auto-sync with status feedback.

# Plan: Revolut Autosync

## Goal
Replace manual "Sync Revolut" clicks with automatic syncing — both server-side (always on) and optional in-app (when admin tab is open).

## Approach

**1. Server-side cron (always-on, primary)**
- Enable `pg_cron` + `pg_net` extensions
- Schedule `revolut-sync-orders` to run every 5 minutes via `cron.schedule` + `net.http_post`
- Runs 24/7 regardless of who's logged in — keeps DB fresh for webhooks, late callbacks, and missed events

**2. In-app autosync toggle (Overview header)**
- Add a small toggle next to the existing Sync button: "Auto-sync: On/Off"
- When On: invokes `revolut-sync-orders` every 2 minutes while the Overview tab is open, then refreshes dashboard data
- Persist toggle state in `localStorage` (default: On)
- Show a subtle "Last synced Xs ago" indicator (reuse `LiveIndicator` styling) so the admin can see freshness
- Existing manual button stays as a force-sync option

**3. New `useRevolutAutoSync` hook**
- Encapsulates the interval, error handling, and last-synced timestamp
- Toast on errors only (silent on success to avoid noise — already 30 syncs/hour)

## Files

**New:**
- `src/hooks/useRevolutAutoSync.ts` — client interval hook with localStorage toggle persistence

**Edited:**
- `src/pages/admin/AdminOverview.tsx` — add Auto-sync toggle next to existing Sync button, wire up the hook, show last-sync timestamp

**Database migration (separate, user-data SQL via insert tool — not migration tool, per Lovable rules):**
- Enable `pg_cron`, `pg_net`
- `cron.schedule('revolut-autosync-5min', '*/5 * * * *', net.http_post(...))` calling `revolut-sync-orders`

## UX

```text
Header right side:
┌──────────────────────────────────────────────────────────┐
│ [● Updated 12s ago]  [Auto-sync ●On]  [↻ Sync Revolut]  │
└──────────────────────────────────────────────────────────┘
```

Toggle uses the existing shadcn `Switch` component, scoped to admin theme.

## Out of scope
- No changes to the `revolut-sync-orders` edge function itself (already idempotent: returns `new_synced` / `updated` counts)
- No retries/backoff on the cron side — if Revolut is down for 5 min, next run picks up
- No realtime websocket updates — polling is sufficient for this volume

## Notes
- Existing manual Sync button stays untouched as an "instant force" action
- Cron runs every 5 min server-side; in-app runs every 2 min when tab is open — both are safe (idempotent upserts)
- All existing functionality, RLS, edge functions, and styling preserved
