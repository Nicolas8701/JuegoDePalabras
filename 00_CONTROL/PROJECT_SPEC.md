# PROJECT_SPEC

Status: APPROVED BASELINE — ADR-0001 approved; numeric player/word-length ranges and secondary modes remain CANDIDATE

- internal codename: PALABRA_ARENA
- elevator pitch: Juego web de adivinar palabras, rejugable sin límite diario, bilingüe ES/EN y centrado en partidas rápidas, satisfactorias y sociales mediante salas públicas o privadas.
- genre: word puzzle / social multiplayer / short-session party game
- platform/stack: APPROVED — Web: Vite + TypeScript + React; Supabase Postgres/Auth/Realtime and authoritative room/guess API. Hosting provider change to Cloudflare Workers + Static Assets is explicitly USER-DIRECTED 2026-10-12, implementation 0.2.3 CANDIDATE; historical Netlify Functions baseline retained under ADR-0001.
- core loop: APPROVED baseline — elegir/join sala → configurar idioma y longitud → ronda sincronizada Race/Same Word → introducir intentos → feedback por letra → resolución → puntuación/resultado → rematch o nueva configuración.
- player count: solo 1; online target 2–8 players per room (CANDIDATE).
- controls: keyboard físico + teclado táctil en pantalla; mouse/touch. Mobile-first.
- game states: HOME, BROWSE_PUBLIC, ROOM_LOBBY, ROUND_COUNTDOWN, ROUND_ACTIVE, ROUND_RESULT, ROOM_RESULT, SETTINGS, DISCONNECTED/RECONNECTING.
- content scope: diccionarios ES/EN con longitudes seleccionables; lanzamiento recomendado 4–8 letras y opción RANDOM dentro del rango validado.
- art direction: identidad propia, limpia y táctil; bloques con profundidad ligera, motion breve y respuesta sonora/háptica. No replicar branding/UI exacta de Wordle/NYT.
- target devices: mobile web first, desktop second; 60 FPS visual target on reference profile.
- accessibility: reduced motion, sound/haptics toggles, color-blind-safe symbols/patterns, high contrast, keyboard-only support.
- save model: local preferences + optional guest/profile stats later. No save crítico requerido for round state; room state authoritative online.
- online/local requirements: APPROVED — public room browser, private room code, quick join, reconnect, host settings, authoritative word/guess validation, no answer exposed to clients before reveal.
- non-goals v0.1: ranked seasonal ladder, user-generated word packs, accounts/social graph, monetization, voice chat.


## Approved requirements from user feedback — 2026-10-12
- Navigation top-level: **local browser game** and **online rooms**.
- Online browser shows **both public and private rooms** with separate browse/create pathways.
- Public rooms have a user-entered room name. Private rooms are discoverable but joining requires a password.
- A room's current host may switch public ↔ private after creation, without changing the room ID or removing existing players.
- Keep UI simple, comfortable across desktop/mobile, with explicit functional/usability QA gates.

Implementation details of password storage, discovery status filters and specific UI layout are **0.2.2 CANDIDATE**; no design approval inferred from merely compiling code.

## User-confirmed new requirements — 2026-10-13
- First contact must ask for a nickname before Local or Online; nickname persists per browser and is editable from top-left of Home.
- Store only normalized text in localStorage (not an authentication credential). Never execute it as markup or SQL; validate names on server too.
- Game board and keyboard must stay centered and playable on mobile and desktop; verify actual compiled React in browser.
- Result screenshot PNG must include personal attempted guesses/letter colors and the revealed answer, not just winner/ranking.
- Client errors must reference current Cloudflare hosting rather than historical Netlify.
Implementation styling, limits and exact layout in 0.2.4 are CANDIDATE until visual human review.
