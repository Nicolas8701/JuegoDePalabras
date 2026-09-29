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
