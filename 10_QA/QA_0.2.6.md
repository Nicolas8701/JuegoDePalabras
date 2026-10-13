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

### Approved-source modular crop QA
- Nine assets total <120 KB; verify WEBP RIFF headers, runtime src, visual imagery loading on 320/375/768/1365 and separate native label/content.
- Playwright checks real room privacy tabs, selected language/mode behavior and hover changes; screenshot captures Home, Configure and Online, then inspect clipping/contrast.
- Source reference SHA256 044b2f5ed415e3696e6ef4639d7e35e9acc31aede03da0ee88560704dd5b4116; avoid committing whole screenshot or profile data.

### Source-crop final QA — PASS 2026-10-13
- Workflow: https://github.com/Nicolas8701/JuegoDePalabras/actions/runs/38449067368 (candidate code exact commit 475d0bba2d24aa120b85f107f2816d762b47745e): **57/57 Node, 37/37 Chromium PASS**, Vite/TypeScript and Wrangler packaging PASS.
- Four viewport dimensions 1365×768, 768×1024, 375×667, 320×640. Visual screenshots in artifact 11838674642 inspected on real compiled web UI for full-width desktop/compact phone, no leaking username, room tabs clickable, image crops only, action arrows visible, native labels editable/localized.
- PASS_SINTAXIS, PASS_RUNTIME (test web build), PASS_ASSET_STRUCTURE, PASS_VISUAL_OBJECTIVE for tested screens. PASS_VISUAL_HUMAN approved source cropping *only* via user; end-to-end hosted GAME_FEEL_HUMAN still pending. Hosted ONLINE remains blocked.

### Approval and deployment record
- User authorized modular use only, and real compiled Chromium QA met that condition. PR #4 merged to main f2938e1 on 2026-10-13. Cloudflare Workers Builds check SUCCESS on merge commit. Hosted public browser check not available from assistant environment, and Supabase multi-client/backend remains blocked; no STABLE.
