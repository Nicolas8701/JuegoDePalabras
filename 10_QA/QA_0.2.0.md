# QA: 0.2.0-dev candidate — 2026-10-09

PASS_SINTAXIS: all server .mjs `node --check`; TS/TSX transpile parser 0 diagnostics (not full tsc/Vite compile).
PASS_RUNTIME_NODE: 22 Node tests on actual MemoryStore/API route implementations.
PASS_CONTENT_CONTRACT: locale packs, scoped answers, strict length, Ñ distinction, random country/language.
PASS_SECURITY_UNIT: hidden secret prior result; body-token POST state contract.
PASS_STRUCTURE: JSON checks, SHA256 manifest and ZIP integrity.
NOT VERIFIED: React/Vite production build; real-browser response/graphics; PC/mobile VISUAL_HUMAN/GAME_FEEL_HUMAN; hosted Supabase migration/test and Netlify RTT P50/P95; concurrency races; anti-abuse.
Regression prevention: answer-vs-guess separation; malformed choices rejected before room creation; strict duel max 2; solo timed terminal; no glyph overlays on tile; exported PNG.
