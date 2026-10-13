# JOB 0.2.3 — Cloudflare hosting migration

Scope: Replace Netlify hosting with Cloudflare Worker+Static Assets without changing gameplay or sala protocol. Maintain Netlify and Supabase. Worker refuses ephemeral MemoryStore; free CPU scrypt problem mitigated for new passwords with secret-keyed HMAC. GitHub review branch/PR, no merge or deploy prod.

Evidence: 45/45 Node PASS and HTTP MemoryStore local smoke. Next QA gates: actual Cloudflare build, staging Supabase, /api/health?deep=1, two clients/host privacy races, CPU/RTT, mobile/desktop visual human.
