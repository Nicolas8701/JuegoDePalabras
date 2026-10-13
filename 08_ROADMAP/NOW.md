# NOW — 0.2.2 ROOM_DISCOVERY_UX_CANDIDATE

- Local browser mode with bundled solo answer pools, no room API after frontend load.
- Online unified public/private discovery with name, lock, population/status; create/join/password; host privacy conversion.
- Hashed private room password; Supabase transaction RPCs for create/join/privacy (migration pending hosted tests); token secrecy and same-word gameplay retained.
- PASS: 40 Node tests, localhost HTTP smoke, TS/TSX syntax and temporary semantic check, CSS layout fixture at 320/375/768/1440.
- NOT PASS: Vite production build, actual PostgreSQL transaction execution, hosted Netlify P95, real-device visual/game-feel, Realtime.
