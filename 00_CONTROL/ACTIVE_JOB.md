# ACTIVE JOB

ID: JOB-0001_VERTICAL_SLICE
Status: IMPLEMENTED / CANDIDATE / HUMAN_QA_PENDING

Objective completed in source:
- bilingual ES/EN board;
- unlimited solo rounds;
- public/private room creation and code join;
- host ready/start lifecycle;
- same-word multiplayer race with 15 s finish grace after first solve;
- authoritative server-side target and guess evaluation;
- safe opponent progress only;
- rematch loop;
- responsive touch/keyboard UI, sound/haptic hooks and reduced-motion CSS;
- Netlify Function + Supabase persistence adapter;
- local in-memory authoritative server for two-tab testing.

Evidence:
- `npm test`: 6/6 PASS;
- all server/Netlify `.mjs`: `node --check` PASS;
- TS/TSX syntax transpile diagnostics: 0;
- local API `/api/health` and `/api/rooms`: PASS;
- frontend dependency install/build: NOT VERIFIED because npm registry was unreachable in this execution environment.

This is not STABLE and has not passed PASS_VISUAL_HUMAN or PASS_GAME_FEEL_HUMAN.
