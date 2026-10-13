# 0.2.2 LOCAL / ONLINE — DEPLOY AND SAFETY

**0.2.2 is CANDIDATE; do not apply directly to production.**

## Local browser mode
Jugar local runs after the site is loaded and does not make gameplay-room HTTP requests. It bundles answer data and is not secure for ranked/online cheating purposes. A cold offline reload is not guaranteed until a service worker/PWA shell exists.

## Online on Netlify
Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in **Netlify environment variables**, not in a `VITE_` variable and not in source control. The online server is authoritative and still uses polling, not WebSockets. Without these variables online returns `503 BACKEND_NOT_CONFIGURED` and local still works once the page loads.

## Staging migration (additive)
Create a database snapshot/checkpoint before SQL changes. On a new staging DB execute these in order:

1. `supabase/schema.sql`
2. `supabase/0.2.0_modes.sql`
3. `supabase/0.2.1_atomic_state.sql`
4. `supabase/0.2.2_room_discovery.sql`

For an existing 0.2.1 DB only execute step 4. Verify `GET /api/health?deep=1` returns `schema.schema = "0.2.2"`.

The new migration adds `rooms.name`, `rooms.password_hash`, transactional service-role-only functions for create/join/privacy, and authenticated state `pa_get_room_state_v2`. Existing private rooms default to `password_hash=NULL` and cannot admit new guests until the current host sets a password. This is an intentional fail-closed behavior; never silently remove their privacy.

**Rollback**: redeploy 0.2.1 client and server; retain additive columns/functions (old code does not access them), and use a database snapshot if the DB migration itself fails. Do not drop live data as a rollback shortcut.

## Required QA before going live
Two concurrent browsers: public create/join, private create/join/wrong password, host privacy conversion while another request joins, host transfer after leaving, active room visible but not joinable, logout/reload, rematch, word secret. Test screen widths 320/375/768/1440 with compiled React. Check `Server-Timing` versus browser RTT in same deployment region; 700ms polling remains an interim measure. Protect room passwords with durable rate limiting before exposing the service widely.
