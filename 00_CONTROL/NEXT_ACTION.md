# NEXT ACTION — 0.2.2-dev (CANDIDATE)

1. Snapshot Supabase staging before migration. Apply `schema.sql` → `0.2.0_modes.sql` → `0.2.1_atomic_state.sql` → `0.2.2_room_discovery.sql`, omitting previously applied stages. Execute last migration as one transaction and verify `/api/health?deep=1` returns schema `0.2.2`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Netlify (do not expose these as Vite env vars). Hosted online needs Supabase; local-browser solo can run without a gameplay API after frontend loads.
3. Stage two clients and compare joining publicly named rooms vs password-protected listed private rooms. Toggle privacy from the host while a guest attempts to join and verify DB locks reject stale permissions (`ROOM_CHANGED`). Test host handoff, room closure and rejoin after reload.
4. Run PostgreSQL / Netlify race testing, mobile 320/375/768/1440 visual, keyboard-only dialog focus and actual device game-feel. Collect browser RTT P50/P95 and `Server-Timing`.
5. Remain CANDIDATE until real Vite build + hosted database QA + VISUAL_HUMAN/GAME_FEEL_HUMAN. No main GitHub push was made.
