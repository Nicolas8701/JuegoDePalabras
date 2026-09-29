# ADR-0001 — Multiplayer mode and backend architecture

Status: APPROVED — 2026-09-28

## Context
The requested game needs public/private rooms, bilingual dictionaries, variable/random word length and high-feel feedback while being hosted on Netlify.

## Decision
**APPROVED: A** — Race / Same Word + Netlify/Vite/React + Netlify Functions + Supabase Realtime/Postgres/Auth.

## Considered alternatives
- B: Race Same Word + Netlify/Vite/React + Firebase backend.
- C: Race Same Word + dedicated WebSocket server + Netlify frontend.

## Primary multiplayer mode
**APPROVED: M1** — simultaneous race on the same word.

## Deferred variants
- M2: cooperative shared board.
- M3: sequential duel / alternating guesses.

## Consequences
- Implementation may proceed on the approved stack and primary multiplayer mode.
- Backend-specific code should remain behind adapters where practical so provider replacement is possible later.
- Secondary multiplayer variants remain non-canonical until separately approved.
