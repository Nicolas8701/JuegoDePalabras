# NOW — 0.2.1 NETWORK_AND_CONTENT_CANDIDATE

- Implemented candidate: `pa_get_room_state_v1` single Supabase RPC; `pa_submit_guess_v1` transaction with row locks, duplicate-letter evaluation and idempotency UUID; `pa_health_v1` verifies migration version.
- Implemented candidate: shorter active polling 700 ms, bounded exponential backoff on errors, per-session in-flight key; `Server-Timing` measurement.
- Implemented candidate: 12 culture locale packs expanded and validated; 1.75 s terminal phase keeps actual scored board visible and tiles free of overlay glyphs.
- PASS: 30 Node tests, 40-state HTTP localhost smoke, TS/TSX transpile syntax, ZIP/JSON checks.
- NOT PASS: hosted SQL execution, concurrent multi-client Netlify, real Supabase P50/P95, Vite bundle, VISUAL_HUMAN/GAME_FEEL_HUMAN.
- NEXT: staging migration + production-like QA. Do not mark STABLE.
