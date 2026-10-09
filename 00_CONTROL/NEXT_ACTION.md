# NEXT ACTION — 0.2.1-dev

1. Snapshot Supabase staging. Run `11_PRODUCTION/web/supabase/0.2.1_atomic_state.sql` after `schema.sql` and `0.2.0_modes.sql`. Never run against production without a rollback plan.
2. Set Netlify SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY securely. Run `/api/health?deep=1`; expect `store=supabase`, `schema.schema=0.2.1`.
3. Deploy candidate to staging and test two simultaneous sessions, two overlapping guesses with same requestId, timeout, host exit, solo/duel, random country/language. Check secret stays hidden.
4. Benchmark client RTT and `Server-Timing` P50/P95, compare against 0.2.0 on same network and region.
5. Perform human 375px / 768px / 1440px visual/game-feel QA; then approve/revise candidate. `prosigue` runs this next safe work, not an unverified production release.
