# ADR-0005 — First-run nickname and presentation recovery

Status: USER-APPROVED integration into main and Cloudflare production (2026-10-13); implementation/visual remains QA CANDIDATE until human game-feel and hosted online verification; no new account/auth authority.

Problem: Game starts without clear player identity; name buried at bottom, four-letter board giant, result PNG incomplete, old Netlify error in Cloudflare.

Decision candidate: Require a nickname 2–18 characters before Local or Online; persistent as `palabra:name` in browser localStorage, editable via Home header; frontend restricts to Unicode letters/numbers/dot/dash/underscore/spaces. Backend normalizes names too. React renders all names as text nodes, Supabase RPC uses JSON input parameters. This **does not authenticate users** nor guarantee global unique usernames.

UI candidate: word-length and viewport-height-aware board, no overlaid tile glyphs; compact scores; exported result includes all letter marks and guesses, word, scoreboard. Client provider error references Cloudflare.

Alternatives: cookie (unneeded server transmission and size); full login (large scope, unwanted barrier); editable guest nickname (selected). Cost minor UI/browser storage and QA; risk name collision/cross-device non-sync, acceptable prototype. Human signoff needed for visual canon.

Testing: GitHub CI Node/Chromium functional; live Supabase and human usability remain gated. Rollback: revert branch/PR, previous localStorage nickname key is compatible. A username is not an account credential.
