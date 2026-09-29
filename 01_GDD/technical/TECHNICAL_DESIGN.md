# TECHNICAL_DESIGN

Status: CANDIDATE IMPLEMENTED — 0.1.0-dev

## Client
Vite + TypeScript + React. Domain-separated folders: API, components, game helpers, hooks, styles and types.

## Authoritative API
`/api/*` contract supports public listing, create, join, ready, start, state, guess and rematch. The target word is held only in server store/`round_secrets`; room-state responses omit it until result.

## Local prototype transport
`server/local-server.mjs` uses `MemoryStore`, allowing two tabs to exercise the real HTTP contract without external services.

## Netlify production transport
Netlify redirects `/api/*` to one function dispatcher. With `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, the same domain API uses `SupabaseStore` and the schema in `supabase/schema.sql`.

## Sync
0.1.0-dev polls safe room state at ~700 ms active / 1200 ms lobby. Supabase Realtime remains APPROVED architecture and is the next transport hardening step after human playtest. Polling is a prototype transport, not a replacement of ADR-0001.
