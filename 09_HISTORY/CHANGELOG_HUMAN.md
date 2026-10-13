# CHANGELOG_HUMAN

## 0.0.2-preproduction — 2026-09-28
- Human approval recorded for ADR-0001.
- APPROVED primary multiplayer mode: simultaneous Race / Same Word.
- APPROVED online stack: Netlify/Vite/React + Netlify Functions + Supabase Postgres/Auth/Realtime.
- User-requested requirements promoted to APPROVED.
- Project moved from DESIGN_GATE to IMPLEMENTATION_READY.
- Exact player/word-length ranges and Spanish normalization remain CANDIDATE.

## 0.0.1-preproduction — 2026-09-28
- Mini-project copied from empty template.
- Captured user requirements as CANDIDATE.
- Defined candidate vision, pillars, core loop, online options, device profiles and QA matrix.
- Opened ADR-0001 for human decision before implementation.

## 0.1.0-dev — 2026-09-28
- First runnable-source vertical slice implemented under `11_PRODUCTION/web`.
- Added solo, public/private rooms, code join, ready/start, same-word round, safe remote progress, 15 s finish grace and rematch.
- Added server-authoritative word selection/evaluation with secret target omitted from active client state.
- Added local in-memory authoritative server plus Netlify Function/Supabase adapter and SQL schema.
- Added original responsive UI, touch/physical keyboard, accessible state symbols, reduced-motion handling, lightweight audio/haptics.
- Added 6 automated tests; all pass. Server syntax and TS/TSX syntax parsing pass.
- Production frontend bundle remains unverified in the creation container because npm registry access timed out; human visual/game-feel QA remains pending.

## 0.2.0-dev candidate — 2026-10-09
- GitHub snapshot audit found only 0.1.0 source, despite 0.1.5 being the latest discussed build; no silent reinstatement of old versions as STABLE.
- Added independently selected game mode, answer language/fixed or random, country/fixed or random, thematic hints, curated culture/insult packs, and longer general answer pools.
- Added quick-duel (exactly 2 players / 5 guesses) and one-word 90-second speed mode. Multi-word survival stays unimplemented candidate.
- Reimplemented clean letter tiles, authoritative 3-second countdown, forfeit/leave/finish, host transfer, 1.75s result delay and downloadable PNG.
- Optimized Supabase read batching and no-N+1 room list, serialised polling, protected session identity, moved session credentials out of URL.
- Added migration and QA regressions. No Vite visual bundle, production P95 latency, or live Supabase pass claimed.


## 0.2.1-dev — CANDIDATE (2026-10-09)
- Authenticated Supabase state RPC (single database request) and transactional guess RPC with request-id deduplication.
- Endpoint `GET /api/health?deep=1` checks 0.2.1 DB RPC; response includes `Server-Timing`.
- 700ms active match polling, adaptive outage backoff and per-session poll guard.
- Culture answer packs expanded for six countries in two languages; finale waits on the real marked grid, followed by sharable result.
- 30/30 tests and localhost HTTP smoke PASS; hosted SQL, build, real-device visual and real Netlify latency still NOT VERIFIED.

## 0.2.2-dev — CANDIDATE (2026-10-12)
- Consolidated Home to local/online and online public/private explorer; discoverable named rooms with password-protected private joins.
- Host can change room privacy after creation without resetting members; browser reflects visibility within periodic refresh.
- Added salted scrypt private password storage, atomic create/join/privacy PostgreSQL RPCs, name to state DTO and host-only checks.
- Added client-only solo mode with curated local answer bundles; preserved online server-secret answers, clean letter tiles and result PNG.
- Added regression suite (40 tests), mobile/desktop CSS fixture, localhost smoke and user-facing migration guidance.
- BLOCKED from STABLE by unrun hosted SQL, Vite bundle, Realtime and real-device QA.

## 0.2.3-dev — Cloudflare migration CANDIDATE (2026-10-12)
- Cloudflare Worker with Static Assets and same `/api/*` contract.
- Fail-closed online backend; no MemoryStore in Workers.
- New hosted room passwords use versioned HMAC with server-only pepper to mitigate scrypt CPU constraints. Legacy scrypt compatible but slow.
- Netlify version/config kept. No Cloudflare deploy or real visual testing claimed.

### 0.2.3 Cloudflare build-config hotfix (2026-10-12)
- Fixed Worker name to match existing `palabraarena` and added regression test.
- Documented Cloudflare monorepo root/build/preview settings; GitHub main remains unchanged.

## 2026-10-13 — GitHub main integration authorized
- User approved PR #1 merge into `main`, resulting merge commit `950b5ad292e721e5dcce5c149d934adb056f7c58`.
- CI on exact candidate head: 46/46 Node PASS, Vite PASS, Wrangler dry-run PASS. Cloudflare Workers Builds success check on merge.
- **NOT STABLE**: public URL, Supabase runtime, security, performance and browser usability still pending. Netlify retained for later redirect only.

## 2026-10-13 — 0.2.4-dev UX Recovery CANDIDATE
- First-run nickname required, persistent per browser and editable from Home top-left, with server/client normalization against markup and SQL metacharacters.
- Game board centered, tiles constrained by height/word length and keyboard visible on mobile+desktop.
- Result now shows all guess colors and PNG includes attempts+solution+scoreboard.
- Missing Supabase message correctly references Cloudflare; local mode remains available.
- 50/50 Node + 6/6 real Chromium e2e + Vite/Wrangler passed in prior CI; expanded viewport pass pending.

- Inspected 8 actual Chromium page screenshots from Actions 38405047135. Board and result fit 320/375/mobile+desktop; follow-up polish: horizontal viewport centering on desktop and shorter compact action labels.

- **FINAL OBJECTIVE QA 0.2.4**: GitHub Actions 38405965139 PASS 50/50 Node + 12/12 real-browser desktop/tablet/mobile/small-mobile + Vite + Wrangler. 8 real browser screenshots captured and inspected. Human usability/game-feel and hosted Supabase online still pending.

## 2026-10-13 — 0.2.4-dev User-approved GitHub/Cloudflare integration
- PR #2 merged into `main`: `67242ce20b7d08570fbad824789df5b72f5f9881`, Cloudflare Workers Builds: SUCCESS.
- Verified prior to merge: 50/50 Node PASS, 12/12 real Chromium PASS, Vite and Wrangler dry-run PASS.
- This authorizes deployment, **not STABLE**: online Supabase, password abuse controls, hosted RTT and human UX still pending.
- Netlify remains unchanged; redirect only after healthy Cloudflare service confirmed.

## 0.2.5-dev — Visual cleanup CANDIDATE (2026-10-13)
- Remove profile step label, nickname rules prose, sample names associated with user, debug version, unlimited/daily and verbose choice copy; headline is PALABRA ARENA.
- 4 horizontally arranged mode choice cards, language flag/world buttons, secondary online duel.
- Missing Supabase is real 503 requiring Cloudflare Worker runtime secrets, not just UI wording.
