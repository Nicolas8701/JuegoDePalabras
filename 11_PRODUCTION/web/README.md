# Palabra Arena — 0.1.0-dev

Primera vertical slice jugable. El cliente nunca recibe la palabra objetivo hasta que termina la ronda.

## Local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. El comando levanta Vite y un servidor autoritativo local en memoria en `:8788`. Abre dos pestañas para probar multijugador.

## Tests / build

```bash
npm test
npm run build
```

## Netlify + Supabase

1. Crea un proyecto de Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL Editor.
3. Configura en Netlify `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Publica esta carpeta como base del sitio.

En Netlify, las llamadas `/api/*` se redirigen a la Function `api` y la persistencia usa Supabase. La service-role key permanece sólo en servidor.

## Estado de red

La vertical slice usa polling corto para sincronizar estado seguro. La integración Realtime/Broadcast aprobada está preparada como siguiente iteración de transporte, sin cambiar el contrato de API ni exponer la solución.
