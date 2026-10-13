# Art Bible

Status: CANDIDATE

## Direction
UI geométrica, táctil y propia; fondos sobrios, tarjetas con contraste alto, tiles con ligera profundidad, tipografía sans legible.

## Shape language
- esquinas medianamente redondeadas;
- tiles cuadrados con micro-elevación;
- botones grandes y cómodos para pulgar;
- iconografía simple de trazo consistente.

## Motion language
- respuesta rápida, spring suave, sin rebotes largos;
- reveal secuencial; confetti corto sólo en hit fuerte;
- feedback nunca debe retrasar la siguiente acción.

## Color semantics
No depender sólo de verde/amarillo/gris. Cada estado debe tener también forma/símbolo/patrón accesible.

## Reference status
`references/reference_word_guess_game_2026-09-28.png` = TEMPORARY_REFERENCE only; not APPROVED, not canonical.

## 0.2.4 responsive refinement (CANDIDATE)
- Square tiles capped against viewport height instead of expanding to fill a fixed 520px board at four letters.
- A calmer hierarchy: centered board, adjacent accessible keyboard, secondary player list; compact result with attempts grid.
- No glyph overlays on letters; color status with external legend remains the user-approved choice.
- This does not modify APPROVED imagery (none); review actual browser screenshots before approving visual canon.

## Illustration candidate 0.2.6
- Four curated 360×200 inline-independent runtime SVG illustrations for mode cards, with dark atmospheric background and a shared cinematic blue/teal/rose/amber palette. No baked strings, icons derived from real illustrated scenes rather than unicode emoji.
- Three SVG language selector art icons: Latin America globe (not single-country flag), Union Jack for English, dice for random.
- Runtime location: `11_PRODUCTION/web/public/images/modes/` and `.../language/`.
- State all PRODUCED/CANDIDATE (not APPROVED). Image source of previous external mockups is not canon. Card composition must pass screenshot QA desktop/mobile and human review.

- Additional 0.2.6 original action SVG illustrations for Local controller and Online two players; artwork state remains CANDIDATE, not APPROVED.
- Visual objective screenshots passed at four viewport widths; Title is semantic h1 but text/pointer selection disabled; language/region selectors remain genuinely independent. Pending user's visual signoff.
