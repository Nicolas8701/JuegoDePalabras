# Architecture — 0.1.0-dev

Status: CANDIDATE IMPLEMENTED

- `web/src/`: React UI only; no secret target data.
- `web/server/domain/`: shared authoritative rules/API dispatcher.
- `web/server/store/`: provider boundary (`MemoryStore` local, `SupabaseStore` Netlify).
- `web/server/data/`: server-only target/guess vocabulary.
- `web/netlify/functions/`: Netlify HTTP adapter.
- `web/supabase/`: persistence schema.
- `web/tests/`: domain, secrecy and room-flow regression tests.

The client consumes one HTTP contract regardless of local/production store. This keeps provider-specific persistence out of gameplay/UI and preserves the option to replace sync transport later.
