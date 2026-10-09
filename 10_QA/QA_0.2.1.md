# QA REPORT 0.2.1-dev — CANDIDATE

**Verified in this execution:**

- 30/30 Node tests via `npm test` (unchanged regression suite plus Supabase RPC mocked PostgREST and server timing).
- `node --check`: every backend `.mjs`; TypeScript `transpileModule`: zero parser errors (NOT full typecheck).
- `npm run smoke:local`: launch actual localhost HTTP server and test create/start/state/forfeit/rematch/leave; 40 POST state samples with **MemoryStore**. Observed P50 1.27 ms, P95 2.66 ms in THIS environment. No external network/Supabase involved; cannot infer Netlify ping.
- Culture content: every (AR, ES, US, MX, GB, CL) × (Spanish, English) has >=25 valid curated answers; English words ASCII; duplicates removed.
- Mocked Supabase wire tests: 1 PostgREST RPC on state, 2 RPCs per guess (mutate + refresh), no token in URL, error if migration missing; SQL security contract checked statically.

**NOT VERIFIED**

- Executing migration SQL or its functions on a real PostgreSQL/Supabase runtime; SQL syntax, permissions, row-lock behavior and concurrent idempotency are NOT a PASS until staged DB test.
- Real Netlify deployment, Supabase Realtime, hosted RTT P50/P95, 2-user concurrent guesses or state race tests.
- Real `npm run build`/Vite (npm install EAI_AGAIN); browser responsiveness and visual human/game-feel human.
- Legacy create/start/join/leave are still multi-request paths, potential partial failure/race window.

**Acceptance gate**: do not call STABLE until hosted SQL/migration/concurrency, full bundle and human/mobile QA succeed.
