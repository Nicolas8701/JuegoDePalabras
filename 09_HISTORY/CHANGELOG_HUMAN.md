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
