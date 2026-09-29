# Engine Decisions

- ADR-0001 APPROVED: Vite + TypeScript + React client on Netlify.
- Netlify Functions own authoritative HTTP actions.
- Supabase Postgres is production persistence; Realtime is approved next transport after vertical-slice validation.
- MemoryStore is development-only and exists to reproduce multiplayer locally without changing the client API.
- The secret target belongs to server persistence only and is serialized only after round result.
