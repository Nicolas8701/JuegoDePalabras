# Palabra Arena 0.2.4 — QA evidence (CANDIDATE)

Root causes: tile dimensions scale with fixed board container instead of word length/viewport; naming optional; stale Netlify copy; Canvas result lacked attempts.

Automated evidence first pass: GitHub Actions 38404477855 — Node 50/50 PASS, Vite production bundle PASS, Wrangler deploy --dry-run PASS, **real Chromium 6/6** at desktop 1365×768 and mobile 375×667 PASS (nickname gate/edit/persist, playable local 4-letter board/key visibility and no horizontal overflow, guessed local word, forfeit/delayed result, PNG download, Cloudflare error). Expanded 320×640 and 768×1024 viewport tests pending re-run.

Security: client/backend Unicode allowlist strips dangerous punctuation/control marks; React escapes text; Supabase RPC inputs remain parameterized. This is defense in depth, not a blanket proof against every injection vector. Password rate limiting/online security still pending.

PENDING: Cloudflare live API with Supabase env/migrations, 2 clients/concurrency, hosted CPU/RTT, mobile real device, accessibility keyboard and human GAME_FEEL + VISUAL approval. Do not mark STABLE until these gates.

Second evidence run (https://github.com/Nicolas8701/JuegoDePalabras/actions/runs/38405047135): 50/50 Node PASS; 12/12 real Chromium desktop 1365×768/mobile 375×667/small-phone 320×640/tablet 768×1024 PASS; compiled Vite and Wrangler dry run PASS. Eight PNG screenshots stored in GitHub Actions artifact `responsive-ux-evidence`, inspected visually. Remaining candidate polish: center desktop board relative to page, shorten small-phone labels, take screenshot after countdown. Re-test pending.

### Final objective browser QA (2026-10-13)
GitHub Actions 38405965139 — **PASS 50/50 Node, 12/12 Playwright Chromium, TypeScript/Vite build, Wrangler dry-run**. Actual screenshots at four viewports saved in artifact `responsive-ux-evidence` (artifact ID 11818887359), visually inspected: clean letter-only tiles, keyboard on screen, no horizontal overflow, central desktop alignment, small-phone header uncluttered, result shows guesses and correctly labeled PNG action. **VISUAL_OBJECTIVE: PASS** for these tested cases, not every state/phone; **VISUAL_HUMAN/GAME_FEEL_HUMAN: PENDING**.

### Human deployment approval and build check
2026-10-13 user explicitly approved PR #2; merged commit `67242ce20b7d08570fbad824789df5b72f5f9881`. Cloudflare Workers Builds production check SUCCESS. No verified hosted `/api/health?deep=1`, Supabase concurrent room tests or human approval of every screen. QA status remains CANDIDATE.
