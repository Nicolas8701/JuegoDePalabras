# PALABRA_ARENA 0.2.1-dev — HANDOFF / CANDIDATE

Baseline: ADR-0001 APPROVED. 0.2.0-dev prior CANDIDATE (historical manifest retained). New 0.2.1 implementation remains CANDIDATE, ADR-0002 needs approval before release. 0.1.5 source equivalence is NOT verified.

Changes: Supabase RPC atomic read + guess (request-id dedupe, no secret disclosure in active rounds), 0.2.1 additive migration, client polling recovery, 12 culture packs expanded, terminal board preview + share result, deep health and Server-Timing.

Tests: 30 Node PASS; local HTTP MemoryStore smoke 40 polls PASS; TS parser zero syntax errors; no Vite bundle nor Supabase runtime/real network test.

Next action: apply migration in STAGING, /api/health?deep=1, two-browser simultaneous tests, hosted P50/P95, mobile/PC visual and human feel, then human approval decision. DO_NOT_REPEAT: never non-atomic attempt updates or claim localhost is online ping.
