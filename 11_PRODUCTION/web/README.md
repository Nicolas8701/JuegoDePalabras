# Current migration (0.2.3-dev CANDIDATE)

See [Cloudflare hosting/setup](README_CLOUDFLARE.md). The Netlify notes below are retained for historical reference only.

> **0.2.2 Candidate:** read [README_0.2.2.md](README_0.2.2.md) for the changed local/online flow, new SQL migration and QA blockers.

# Palabra Arena 0.2.0-dev — CANDIDATE

Esta rama de trabajo se creó a partir del **repositorio GitHub 0.1.0-dev** suministrado el 2026-10-09. Aunque en el chat se había entregado 0.1.5, **los archivos fuente 0.1.5 no aparecen en este ZIP/repo**. La rama principal de GitHub NO se modificó. Se portaron de vuelta las funciones críticas posteriores identificables en el historial: salida y rendición autoritativas, cuenta atrás de 3 s, casillas sin glifos superpuestos, retraso visual terminal de 1,75 s y PNG de resultado. No declarar equivalencia binaria ni de QA con 0.1.5.

## Inicio en Windows / Linux

- Ejecutar `START_LOCAL.bat` en la raíz para Windows, o `./START_LOCAL.sh` en Linux. Requiere Node 20+ y acceso a npm.
- O bien `cd 11_PRODUCTION/web && npm install && npm run dev`.
- Abre http://localhost:5173. El servidor local usa MemoryStore (sólo pruebas).
- Tests: `npm test`; producción: `npm run build`.

## Configurar Netlify / Supabase (obligatorio en producción)

1. Proyecto Supabase real con Postgres: ejecutar `supabase/schema.sql` si es instalación nueva.
2. Ejecutar `supabase/0.2.0_modes.sql` también para instalaciones nuevas y existentes (NO destruye tablas).
3. En Netlify → Environment variables definir `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (NUNCA exponer service role al navegador).
4. Hacer deploy con `netlify.toml` de la raíz: base `11_PRODUCTION/web`, build `npm run build`, publish `dist`, Function `api`.
5. Visitar `/api/health`: debe devolver `store: supabase`.

**Importante:** sin Supabase configurado, Netlify responde explícitamente `503 BACKEND_NOT_CONFIGURED`. No hay persistencia alternativa de Netlify Blobs en el código fuente recibido, a diferencia del candidato 0.1.5 referido en el chat. Nunca usar MemoryStore efímero en Functions como un backend de salas productivo.

## Modos / contenido

- `classic`: ES/EN, respuestas curadas ampliadas; el diccionario de intentos sigue validación abierta por formato/longitud durante prototipo.
- `culture`: Argentina, España, Estados Unidos, México, Reino Unido, Chile o país al azar. Respuestas asociadas al país y redactadas separadamente en español/inglés, con pista temática (no la palabra).
- `insults`: jerga e insultos comunes por región; voluntario, fuera del modo clásico.
- `blitz`: contrarreloj de UNA palabra durante 90 segundos. No es todavía una cadena infinita de palabras.
- `duel`: sala de dos jugadores, cinco intentos. No admite modo solo.
- Idioma al azar: puede variar entre ES y EN en cada ronda; país aleatorio selecciona entre países que posean respuestas de la longitud elegida.
- Supervivencia de varias rondas/vidas está diseñado como idea CANDIDATE, no implementado.

La mayoría de packs temáticos aún son pequeños y necesitan expansión editorial/curación, sobre todo insultos. Se ocultan soluciones hasta resultado; mensajes de error por longitud/tema no crean salas huérfanas. Una respuesta que tenga esa longitud pero no exista en el pack devuelve error antes de crear sala.

## Red y estado

- `POST /api/rooms/{roomId}/state` lleva `playerId/token` en el BODY en lugar del querystring; `GET` antiguo sigue disponible por compatibilidad.
- `SupabaseStore.getRoomState` ejecuta lecturas independientes en paralelo, elimina el `auth → finalize → re-fetch` redundante, y `listPublicRooms` ya no hace N+1 consultas por sala.
- Sondeo serializado del cliente: 1,1 s en partida, 2,4 s en lobby/result; pausa en pestaña oculta; las respuestas antiguas de una sesión descartada no pueden destruir sesiones nuevas. El teclado es local, sólo la validación de cada guess viaja al servidor.
- Las optimizaciones son **estructurales**: no hay aún medición de ping real en Netlify ni Supabase Realtime/Broadcast implementado. Medir P50/P95 antes de prometer mejoras numéricas.
- Persistencia de replays, rankings, moderación online, penalización por brute force y rate limiting público siguen pendientes para producción.

## QA real en este paquete

- PASS: suite Node backend, parser JS, parser TS/TSX, JSON, estructura del ZIP e integridad.
- NO VERIFICADO: `npm install`/`vite build` (registro npm inaccesible en este entorno), Chrome/Playwright, UI visual PC/mobile, RTT real de Internet y concurrencia productiva Supabase.
- Entregar como DEV/CANDIDATE. No subir como STABLE sin los gates faltantes.


### Migration 0.2.1 CANDIDATE
After `schema.sql` + `0.2.0_modes.sql`, run `0.2.1_atomic_state.sql` in a staging Supabase database. Validate `/api/health?deep=1` before testing online. Atomic state/guess RPCs require this migration. `npm run smoke:local` tests only local MemoryStore, not Supabase performance.
