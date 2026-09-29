# 02_CORE_LOOP

Status: PARTIALLY APPROVED — primary multiplayer mode approved; word-length range and Spanish normalization remain CANDIDATE

## Primary loop
1. Elegir idioma: Español / English.
2. Elegir modo: Solo / Sala pública / Sala privada.
3. Elegir longitud: 4–8 o RANDOM (rango CANDIDATE).
4. En sala: ready → countdown de 3 s → todos reciben la misma palabra objetivo.
5. Cada jugador dispone de intentos según longitud; sus guesses se validan de forma autoritativa.
6. El tablero revela estados de letra con animación secuencial.
7. La sala muestra sólo progreso externo seguro: fila alcanzada, tiempo y estado resuelto/no resuelto.
8. Termina cuando todos resuelven/fallan o vence el timer.
9. Resultado: posición/puntos + solución + tiempo + rematch instantáneo.

## Primary multiplayer mode — APPROVED
**Race / Same Word**: todos juegan simultáneamente la misma palabra. Gana quien la resuelve primero; fallar consume intentos. La ronda puede seguir unos segundos tras el primer acierto para que el resto termine.

## Spanish normalization — CANDIDATE
- `ñ` es distinta de `n`.
- tildes `áéíóúü` se pueden escribir o no para validación; matching usa forma normalizada, pero la palabra mostrada al final conserva ortografía canónica.
- la longitud se cuenta por letra visible canónica.
