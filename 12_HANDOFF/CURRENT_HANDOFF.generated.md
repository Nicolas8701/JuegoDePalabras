# PALABRA ARENA — HANDOFF CANDIDATE 0.2.2-dev

- Authority: universal V2 approved; PROJECT_SPEC and ADR-0001 approved; ADR-0002 and ADR-0003 are CANDIDATE.
- Parent: 0.2.1-dev candidate ZIP, recovered from provided project artifact. Source gap to historical 0.1.5 remains disclosed.
- User-approved requirements: local vs online, both public/private rooms discoverable, public named, private password, host privacy conversion, clear comfortable UX.
- Implemented: client-local single player uses bundled curated answer pools and same GameBoard/Result (no gameplay backend calls). Online list tabs Public/Private, named rooms and passwords, host privacy editor, protected join and atomic PostgreSQL create/join/privacy; online word secret still server-side. Only join in lobby.
- 0.2.2 migration: `11_PRODUCTION/web/supabase/0.2.2_room_discovery.sql` after 0.2.1. Room name+password_hash columns; pa_get_room_state_v2 / pa_join_room_v2 / pa_create_room_v2 / pa_change_privacy_v2; service-role only. Existing private rooms with null hash deny joins until host sets a password. Snapshot first; old code rollback leaves additive DB changes.
- QA: 40/40 Node PASS; localhost smoke PASS 40 HTTP state reads; source TS/TSX parse zero errors, temporary semantic React stubs PASS; Chromium CSS fixture 320/375/768/1440 PASS no document overflow and main controls ≥44px. **No Vite build**, no actual PostgreSQL transaction E2E, no mobile/desktop human visual/game-feel, no real Netlify RTT.
- Risks: private password brute-force durable rate limiting not implemented, online still polling not Realtime, old room lifecycle actions start/leave not atomic, offline reload not guaranteed without PWA caching.
- Don't repeat: do not treat short room code as the password, do not hide private rooms from discovery, do not put 5 create/join options on Home, do not claim production PASS from JS-only SQL assertions, do not expose answer or password hash to client.
- Next action: staging migration + two browser E2E for public/private/name/password/change privacy mid-join, reconnect/host handoff, browser build and actual mobile/PC UX. Then P50/P95 hosted Netlify RTT and Realtime candidate.
- GitHub `Nicolas8701/JuegoDePalabras` main untouched; deliver full ZIP with manifests and migration.
