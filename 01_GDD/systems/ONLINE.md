# ONLINE

Status: APPROVED — ADR-0001

## Required behavior
- sala privada con código corto;
- listado/quick-join de salas públicas;
- host configura idioma + longitud fija o random;
- presencia de jugadores y ready state;
- reconexión tolerante a cortes breves;
- servidor/función autoritativa para crear ronda, elegir palabra y validar guess;
- jamás enviar la solución al cliente antes del cierre de ronda;
- rate limiting básico y validación de payloads.

## Architecture options

### A — Netlify frontend + Netlify Functions + Supabase (APPROVED)
- Netlify: hosting y endpoints HTTP cortos.
- Supabase: Postgres, Auth guest/anonymous, Realtime Presence/Broadcast, RLS.
- Netlify Functions: create/join/start/submitGuess/endRound usando credenciales server-side.
- Pros: encaja con Netlify, realtime ya resuelto, persistencia y seguridad razonables, coste inicial bajo.
- Coste: dos servicios y schema/RLS que hay que mantener.
- Riesgo: dependencia de proveedor Realtime; mitigar encapsulando `RealtimeAdapter`.

### B — Netlify frontend + Firebase
- Firestore/Realtime Database + anonymous auth + Cloud Functions.
- Pros: ecosistema maduro y sync sencillo.
- Coste: lógica y pricing menos transparentes para ciertas cargas; más acoplamiento al modelo Firebase.

### C — Netlify frontend + servidor WebSocket dedicado (Fly/Render/Railway/etc.)
- Pros: máxima autoridad y control del tick/protocolo.
- Coste/risgo: más DevOps, disponibilidad, observabilidad y despliegue; excesivo para v0.1 salvo que el juego crezca en complejidad realtime.

## Network event model
Room events are low frequency. Do not bind gameplay timing to render FPS. UI timers derive from monotonic local time synchronized against authoritative round timestamps.
