# QA 0.2.6 — Illustrated mode cards
Status: VISUAL_OBJECTIVE PASS on tested states; VISUAL_HUMAN and GAME_FEEL_HUMAN PENDING.

## Functional/objective evidence
- GitHub Actions [38444786639](https://github.com/Nicolas8701/JuegoDePalabras/actions/runs/38444786639) on code commit 29f5bc5d6f91dcbd49e2ea62b3f005242cf62c0e.
- 54/54 Node tests PASS: previous room/privacy, lexical, secret and UX guards + image sources, title behavior, theme/language independent selection.
- 28/28 real Chromium browser tests PASS at 320×640, 375×667, 768×1024, 1365×768: first-run profile, Local game, PNG result, error strings, user-select:none title, four loaded mode SVGs, independent EN answer with AR theme, no language-icon overlap and six length buttons inside row.
- Vite TypeScript build PASS, Wrangler --dry-run PASS, 4 static mode cards plus 3 language icons + 2 Local/Online icon SVGs.
- Screenshot artifact `responsive-ux-evidence` #11838022958 (16 screenshots), inspected desktop and small phone for alignment, clipping, illustrative consistency.

## Regression / fixes discovered during screenshot review
- ES/EN/random illustrations overlapped text at 320 and 375: corrected via vertical mobile language button hierarchy.
- Length mode 'Azar' clipped at 320/375: six equal grid columns.
- Prevent silent return to emoji placeholders via source/content and real image-load E2E checks.
- Record as PA-UX-012/013/014 in BUG_LEDGER; DNR-VISUAL-003/004.

## Still pending / excluded from claim
- Human visual approval, motion feel and physical touch interaction; no canon promotion solely due to green tests.
- Hosted Cloudflare online API with Supabase configured, migrations, two-browser joins, password protection/rate limiting and latency.
- Do not call this STABLE. `main`/Cloudflare production remains 0.2.5 until explicit merge approval.
