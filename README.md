> **0.2.2-dev CANDIDATE:** local/online split, discoverable public/private named rooms, hashed room passwords, host privacy conversion. See `11_PRODUCTION/web/README_0.2.2.md`.

# PALABRA ARENA — 0.2.0 DEV CANDIDATE

Proyecto de juego web de palabras ES/EN con salas públicas/privadas, modos regionales y partida infinita. Consulta `11_PRODUCTION/web/README.md` para instalación, Netlify, migración, QA y limitaciones.

**Fuente de este paquete:** ZIP `JuegoDePalabras-main.zip` del repositorio `Nicolas8701/JuegoDePalabras` (0.1.0-dev); 0.1.5 no estaba disponible como fuente en el repositorio. Esta candidate restaura funcionalidades críticas conocidas de 0.1.5 sin afirmar equivalencia exacta. La rama remota main no ha sido modificada.

Ejecutá `START_LOCAL.bat` o `START_LOCAL.sh` en la raíz.

## Cambios críticos 0.2.1

- **Aplicar migración en staging ANTES del deploy:** `11_PRODUCTION/web/supabase/0.2.1_atomic_state.sql`. Suprime actualizaciones de intentos no atómicas, agrega `client_request_id` nullable e índice único, y funciones de estado/guesses/health exclusivas de service_role. No borra partidas existentes.
- Verificar `/api/health?deep=1`: `schema.schema` debe ser `0.2.1`. Si falta la migración, el juego devuelve `DB_MIGRATION_REQUIRED` (503) en vez de actuar con una implementación incorrecta.
- Para hacer rollback, redeploy 0.2.0; las columnas y funciones aditivas permanecen sin uso. No ejecutar `DROP` en producción sin revisión DBA.
- `npm run smoke:local` no requiere npm install, prueba el servidor MemoryStore por HTTP y mide RTT **localhost únicamente**. No acredita performance de Supabase.
- La respuesta final conserva el tablero evaluado durante 1,75 s antes de abrir la pantalla de captura PNG.
- Nuevos tests: `tests/supabase-rpc.test.mjs` y `tests/api-telemetry.test.mjs`. No equivalen a un test PostgreSQL real.

## Pendientes imprescindibles antes de producción

- `npm run build`, responsive visual / game-feel PC-móvil, validación de las funciones PL/pgSQL y pruebas simultáneas hospedadas.
- Concurrencia de crear/iniciar/unirse/salir sala aún depende de varias escrituras REST; no se anuncia como corregida.
- Realtime/Broadcast y latencia real Netlify siguen pendientes; lo que se implementó es la reducción estructural de requests, no un WebSocket.
