# QA — 0.2.2-dev CANDIDATE — 2026-10-12

## Automated results
- PASS Node regression suite **40/40** (30 inherited + 10 room/discovery/solo tests).
- PASS `node scripts/smoke-local-api.mjs` on localhost MemoryStore, round lifecycle + 40 HTTP reads. No hosted ping claim.
- PASS `node --check` server `.mjs`; TS/TSX syntax parser zero errors; temporary TypeScript semantic check with minimal React stubs PASS (does not prove a Vite build).
- PASS Chromium CSS-fixture layout at 320/375/768/1440 CSS px: no horizontal document overflow, minimum main control height 46px. Fixture mimics markup and is NOT compiled React rendering.
- PASS secret visibility assertions: private password hashes absent from lists/state; online word absent until `result`.

## Functional cases covered in Node
1. Public and private listed with name/visibility; no password exposure.
2. Private requires password, correct password works, wrong/absent is rejected.
3. Host public→private→public preserves player membership/room ID and clears hash on public.
4. Guest cannot change privacy; host handoff; closed room removed from discovery.
5. Lobby can be joined, active/result visible but not joinable.
6. API private join/host token checks and service-role SQL contracts.
7. Offline local packs, ES/EN lengths and duplicate-letter feedback.
8. State RPC and guess RPC remain authenticated and hide secret until result.

## NOT VERIFIED — blocking production approval
- Supabase actual PL/pgSQL 0.2.2 execution / multi-instance join and visibility races; migration staging/rollback.
- Vite/React production bundle `npm install && npm run build` (npm EAI_AGAIN here).
- Browser end-to-end actual React routes (including mobile keyboard), real-device usability/keyboard focus tests and human game-feel.
- Client RTT P50/P95, Netlify regional performance and proper Realtime/event-driven refresh.
- Online password brute-force protections across multiple serverless instances.
- Offline reload without cached PWA shell: local game itself is API-independent, frontend still must load.
