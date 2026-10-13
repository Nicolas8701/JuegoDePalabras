# ADR-0003 — ROOM DISCOVERY, PRIVACY AND LOCAL BROWSER GAME
Status: CANDIDATE — user requirements approved, technical detail unapproved.

## Context
Existing Home used five competing flows; private room code functioned as invitation-only and rooms were hidden from the browser. User now requires separate local/online modes, listed public/private rooms, room names/passwords and host privacy transitions.

## Decision candidate
Keep ADR-0001 stack for online. Public browser lists both visibilities; private password is stored as salted scrypt hash; server checks it and runs locked join transaction. Local single-player runs in browser with a non-authoritative offline answer bundle, avoiding Supabase. Online answers remain server secret.

## Alternatives
1. Hidden private rooms by code only — rejected by user's new requirement.
2. Private room key as password — rejected for low entropy and unwanted disclosure in listings.
3. Publicly listed private rooms with separate password — implemented candidate.

## Risk and rollback
Risk: abusive password guessing needs persistent rate limiter; SQL RPCs untested on hosted PG; local bundle visibly contains solo answers (not suitable for competitive online, where it is not used). Rollback: redeploy 0.2.1 source; additive columns/functions can remain unused. Never drop live tables to roll back.

## Definition of done
Staging SQL create/join/privacy tests with race workloads, Vite build, 2-browser online test, browser offline local after load, desktop/mobile responsive and game-feel human PASS. No auto-promotion to APPROVED.
