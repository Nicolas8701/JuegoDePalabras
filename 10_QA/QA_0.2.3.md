# QA 0.2.3-dev — Cloudflare

PASS: 46/46 Node via GitHub Actions 38332875429 (Worker routes/static, fail closed, password hash, 0.2.2 regressions and portability guard).
PASS: local Node MemoryStore HTTP smoke (not Cloudflare RTT).
PASS: GitHub Actions Vite TypeScript build + Wrangler deploy --dry-run. PASS: Cloudflare Workers Builds check on main merge 950b5ad.
PENDING: public Cloudflare URL / hosted Worker API verified, Supabase runtime secrets+staging SQL, Free CPU, persistent password rate limiting, browser mobile/PC functional+usability, human game feel.
Status CANDIDATE. No STABLE, no live Cloudflare URL claim.
