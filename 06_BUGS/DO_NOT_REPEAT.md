# Do Not Repeat

Empty.


## DNR-006 — No volver a registrar intentos por lecturas y PATCH separados
En backend alojado, el jugador y la ronda comparten estado concurrente. Los cambios a intentos deben ocurrir en una transacción atómica y tener prueba real de concurrencia antes de STABLE. No declarar cobertura por un mock de SQL.

## DNR-007 — No presentar P50/P95 localhost como ping online
Guardar por separado métricas de red (RTT navegador) y tiempo de procesamiento (`Server-Timing`). No prometer mejora de ping hasta comparar la misma región/condiciones en Netlify.

- DNR-ROOM-PASSWORD: never use short invite code as the password for a private room. List private rooms publicly but require password, hash at rest, do not expose hashes in DTO/RPC output; check host and privacy under DB lock.
- DNR-ROOM-UX: do not restore five separate create/join paths on the home screen; local/online first, discovery/create next. Test 320px mobile overflow and touch targets before presenting a candidate.

- DNR-CI-001: Never import TypeScript or any other toolchain from machine-specific global absolute paths in tests. Use package dependency imports and run CI on clean Linux checkout. Evidence: GitHub Actions 38332693667.

- DNR-CI-002: Parser/type stubs alone never certify Vite/TypeScript build; compile via clean GitHub CI before offering release. Regression for onClick callback signatures and discriminated-mode indexing in local-engine. Evidence GitHub Actions 38332791361.

- DNR-VISUAL-003: Do not satisfy requests for 'illustrated, developed mode buttons' by replacing one emoji with another unicode glyph or thin CSS borders. Require original actual image assets, card hierarchy, selected/hover/focus states, mobile screenshots and human review. Evidence: repeated 0.2.4/0.2.5 low-fidelity mode selector feedback. Also do not conflate regional theme country with answer language.
