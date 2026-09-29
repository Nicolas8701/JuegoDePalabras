# PALABRA_ARENA

Estado: **0.1.0-dev — PROTOTYPE / VERTICAL_SLICE_CANDIDATE**

Juego web bilingüe de adivinar palabras, sin límite diario, con solo y Race/Same Word en salas públicas o privadas. La referencia visual original se conserva sólo como referencia temporal; la UI implementada usa identidad propia.

## Probar localmente

Windows: doble clic en `START_LOCAL.bat`.

macOS/Linux:

```bash
./START_LOCAL.sh
```

El launcher instala dependencias si faltan y levanta cliente + API autoritativa local. Abre `http://localhost:5173`. Para multijugador local, usa dos pestañas/ventanas.

Código runtime: `11_PRODUCTION/web/`.

## Netlify

El `netlify.toml` de la raíz usa `11_PRODUCTION/web` como base. Para persistencia online real, ejecutar `11_PRODUCTION/web/supabase/schema.sql` y configurar `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` en Netlify.

## Estado de QA

Automated server/domain/API checks pasan. La build de Vite no pudo ejecutarse en el contenedor de creación porque el registro npm no respondió; por lo tanto esta entrega NO es STABLE ni tiene PASS_VISUAL_HUMAN/GAME_FEEL_HUMAN todavía.

Los rangos 4–8 letras, máximo 8 jugadores, 6 intentos y ventana final de 15 s son CANDIDATE de playtest, no canon irreversible.
