# Palabra Arena 0.2.3-dev — Cloudflare Workers (CANDIDATE)

La versión Netlify queda intacta. Worker sirve el frontend Vite y la API /api/*; Supabase sigue siendo la fuente de verdad para salas, contraseñas e intentos.

## Primer deploy, rama candidata
1. En Supabase staging aplicá schema.sql → 0.2.0_modes.sql → 0.2.1_atomic_state.sql → 0.2.2_room_discovery.sql. No hay una nueva migración SQL para cambiar el proveedor web.
2. Conectá en Cloudflare Workers Builds el repositorio `Nicolas8701/JuegoDePalabras`, rama candidata antes de merge; Root directory: `11_PRODUCTION/web`, build `npm run build`, deploy `npx wrangler deploy`. Usá staging Supabase distinto de producción.
3. En Cloudflare Worker > Settings > Variables and Secrets añadí `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` como secretos de RUNTIME, jamás como `VITE_*`. Recomendado `ROOM_PASSWORD_PEPPER` secreto estable, antes de crear privadas.
4. Alternativa CLI en `11_PRODUCTION/web`: `npm install`, `npm test`, `npm run build`, `npx wrangler login`, `npx wrangler secret put SUPABASE_URL`, `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`, `npm run deploy:cloudflare`.
5. Verificá `https://<worker>.workers.dev/api/health?deep=1`, con `store:supabase` y schema 0.2.2. Sin secretos devuelve 503, nunca MemoryStore efímero.
6. Probar en dos navegadores: pública/privada, contraseña errónea/correcta, cambios de privacidad concurrentes, jugar, rematch, salida, partida local sin API y visual móvil/PC. Medir RTT/P95 y CPU Worker antes de release.

**Free Tier**: límite aproximado a octubre 2026 100.000 peticiones/día y 10 ms CPU/solicitud. El polling consume cuota; no prometer ilimitado. La verificación `scrypt` legacy puede exceder CPU free; nuevas contraseñas online usan hash `hmac256` con secreto del servidor. Un hash HMAC es seguro contra diccionario offline SOLO si el pepper nunca se filtra: usar un secreto estable independiente, rotaciones requieren reset. Las antiguas scrypt pueden seguir existiendo y deben ser reemplazadas por el host desde el lobby cuando sea posible. Rate limiting contra adivinar contraseñas aún es bloqueo de lanzamiento público.

Conservá la versión de Netlify y NO instales redirección hasta confirmar URL Cloudflare. No usar la vieja función Netlify para abrir contraseñas hmac256 del nuevo sistema. Plan de reversión: rama main/0.2.2 + Supabase sin migraciones destructivas.

QA disponible: 45/45 Node, HTTP MemoryStore local PASS; build Vite/Cloudflare real, Supabase staging, QA humano y rendimiento alojado PENDIENTES.

Fuentes:
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/agent-setup/codex/

## Diagnóstico Cloudflare: Could not detect a directory containing static files

El build de Cloudflare compartido por el usuario utilizó **Root directory `/`, Build command `None` y branch `main`**. Ahí no están ni `wrangler.jsonc` ni la aplicación React de la candidata.

En el Worker existente **palabraarena**, entrar a **Settings > Build** y configurar:

- Root directory: `11_PRODUCTION/web` (sin barra inicial).
- Build command: `npm run build` (genera `dist/index.html` y assets Vite).
- Deploy command: `npx wrangler deploy`.
- En **Settings > Build > Branch control**, habilitar **builds de ramas no productivas** y probar `candidate/cloudflare-0.2.3`; mantener `main` sin cambios hasta aprobar la candidata. No basta reintentar un build de `main`.
- El campo `name` de Wrangler ahora coincide con el Worker existente `palabraarena`; no es necesario crear otro Worker.
- Los secretos de Supabase son **runtime secrets** en **Settings > Variables & Secrets**, no `Build variables`.
- El subdominio `workers.dev` del panel estaba deshabilitado. Usar preview URL o habilitarlo una vez desplegado y validado.

Fuente oficial: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
