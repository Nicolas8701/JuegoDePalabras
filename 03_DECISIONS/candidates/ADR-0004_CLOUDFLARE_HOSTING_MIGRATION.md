# ADR-0004 — Cloudflare Workers hosting migration

Status: APPROVED provider change and GitHub main integration (human approval 2026-10-13); technical implementation remains CANDIDATE pending hosted runtime/Supabase/security/visual gates.

This supersedes only the Netlify hosting component of APPROVED ADR-0001. React, Supabase, Race/Same Word and client/server secret separation remain unchanged.

Decision candidate: single Cloudflare Worker with Static Assets + /api/*; fail closed without persistent Supabase. No D1/DO migration during provider move. Netlify config preserved; future HTML redirect only after verified Worker URL.

Alternatives: separate Pages frontend + Worker API (more config); one Worker SPA+API (selected); entire D1/Durable Objects rewrite (higher blast radius, rejected for migration). Benefits lower dependence on exhausted Netlify credits; costs Wrangler/CI changes and hosted QA. Risk Worker Free 10ms CPU, Supabase cross-region RTT, password guessing and legacy synchronous scrypt. Priority CRITICAL, before more gameplay modes.

Candidate security: new hosted private hashes salted HMAC-SHA256 with stable server-only ROOM_PASSWORD_PEPPER (service role secret fallback). Legacy scrypt remains readable but CPU-expensive; rotation must explicitly reset passwords. This algorithm requires review, persistent rate limiting and hosted CPU test. No production approval.

Rollback: old Netlify branch and configs untouched. Keep additive Supabase SQL without dropping tables; do not use old Netlify code to join new HMAC-hashed private rooms.
