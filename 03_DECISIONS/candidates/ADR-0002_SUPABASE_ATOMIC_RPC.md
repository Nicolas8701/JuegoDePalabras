# ADR-0002 — Atomic Supabase RPC for state and attempts

STATUS: CANDIDATE (human review before release approval). BASELINE: ADR-0001 remains APPROVED.

Problem: repeated PostgREST fan-out adds network round trips and non-atomic guessing allows count/winner races.
Chosen candidate: keep Netlify Functions as HTTP authority and Supabase as data authority. One server-only SECURITY DEFINER RPC reads a player's state. Another transaction evaluates and inserts guesses with row locks + optional request UUID idempotency. Secrets remain server-side until result. All RPC EXECUTE permissions are revoked from public/anon/authenticated and granted to service_role only.

Alternatives: (1) maintain multi-REST polling (lower development cost, worse consistency); (2) Realtime-only transport (events cannot replace authoritative transactions); (3) dedicated persistent game server (higher operational cost). RPC selected as candidate for minimal necessary change.

Benefit: far fewer Netlify-to-PostgREST HTTP requests; transaction-level attempt integrity; diagnosable migrations. Cost: SQL maintenance, migrations and staging concurrency tests. Risk: SECURITY DEFINER and SQL bugs; follow staged testing and least privilege. Rollback: redeploy version 0.2.0 code; DB columns/functions are additive and may remain dormant; optional DBA-reviewed `DROP FUNCTION` afterward. No destructive data rollback.

Priority: HIGH. Dependencies: Supabase schema + mode migration. Proposed timing: before public release and measured performance tuning. No STABLE until PostgreSQL runtime validation.
