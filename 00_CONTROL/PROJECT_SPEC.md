# PROJECT_SPEC

Status: APPROVED BASELINE — ADR-0001 approved; numeric player/word-length ranges and secondary modes remain CANDIDATE

- internal codename: PALABRA_ARENA
- elevator pitch: Juego web de adivinar palabras, rejugable sin límite diario, bilingüe ES/EN y centrado en partidas rápidas, satisfactorias y sociales mediante salas públicas o privadas.
- genre: word puzzle / social multiplayer / short-session party game
- platform/stack: APPROVED — Web: Vite + TypeScript + React on Netlify; Supabase Postgres/Auth/Realtime; Netlify Functions for authoritative room/guess endpoints.
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
