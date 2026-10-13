# Palabra Arena 0.2.4 — QA evidence (CANDIDATE)

Root causes: tile dimensions scale with fixed board container instead of word length/viewport; naming optional; stale Netlify copy; Canvas result lacked attempts.

Automated evidence first pass: GitHub Actions 38404477855 — Node 50/50 PASS, Vite production bundle PASS, Wrangler deploy --dry-run PASS, **real Chromium 6/6** at desktop 1365×768 and mobile 375×667 PASS (nickname gate/edit/persist, playable local 4-letter board/key visibility and no horizontal overflow, guessed local word, forfeit/delayed result, PNG download, Cloudflare error). Expanded 320×640 and 768×1024 viewport tests pending re-run.

Security: client/backend Unicode allowlist strips dangerous punctuation/control marks; React escapes text; Supabase RPC inputs remain parameterized. This is defense in depth, not a blanket proof against every injection vector. Password rate limiting/online security still pending.

PENDING: Cloudflare live API with Supabase env/migrations, 2 clients/concurrency, hosted CPU/RTT, mobile real device, accessibility keyboard and human GAME_FEEL + VISUAL approval. Do not mark STABLE until these gates.
