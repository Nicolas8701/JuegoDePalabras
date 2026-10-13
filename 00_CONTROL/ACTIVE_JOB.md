# JOB — PALABRA ARENA 0.2.2

Status: CANDIDATE implementation ready for staging QA.

Goal: clarify local vs online entry and remove saturated navigation; show named public and discoverable password-protected private rooms; allow authenticated host privacy conversion without losing room members. Preserve prior same-word/secret/feedback/pause/PNG gameplay.

Executor/tools: local code editing, Node test runner, temporary TS semantic stubs and Chromium CSS fixture (no new provider-authority). Risks: online protocol change, migration and password abuse. Reversibility: redeploy old source, preserve DB additive columns. No GitHub main changes.

Acceptance: true Postgres transaction create/join/privacy, staging E2E in two browsers, no hash leak, invalid password denial, mobile/desktop UX, performance metrics in Netlify, human visual/feel. Existing automated 40/40 Node tests and CSS fixture are only partial evidence.
