# Do Not Repeat

Empty.


## DNR-006 — No volver a registrar intentos por lecturas y PATCH separados
En backend alojado, el jugador y la ronda comparten estado concurrente. Los cambios a intentos deben ocurrir en una transacción atómica y tener prueba real de concurrencia antes de STABLE. No declarar cobertura por un mock de SQL.

## DNR-007 — No presentar P50/P95 localhost como ping online
Guardar por separado métricas de red (RTT navegador) y tiempo de procesamiento (`Server-Timing`). No prometer mejora de ping hasta comparar la misma región/condiciones en Netlify.
