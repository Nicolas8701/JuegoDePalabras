# QA Matrix

Status: 0.1.0-dev PARTIAL

| Area | Scenario | Result / expected |
|---|---|---|
| Domain | duplicate-letter evaluation | PASS automated |
| Domain | fixed/random supported lengths | PASS automated |
| ES normalization | accent stripping + distinct Ñ | PASS automated |
| Room | private create/join/start | PASS automated memory-store |
| Security | active state does not expose target | PASS automated |
| Public room | private excluded from public list | PASS automated |
| HTTP | create/join/ready/start contract | PASS automated |
| Server syntax | all `.mjs` | PASS `node --check` |
| TS/TSX syntax | parser transpile diagnostics | PASS 0 errors |
| Local API | `/api/health`, `/api/rooms` | PASS smoke |
| Frontend bundle | `npm install && npm run build` | BLOCKED in current container: npm registry unreachable |
| Input | rapid keyboard + touch | HUMAN/RUNTIME PENDING |
| Two clients | same room/round/progress | HUMAN/RUNTIME PENDING |
| Private code | invalid/valid code UX | HUMAN/RUNTIME PENDING |
| Reconnect | reload during room/round | HUMAN/RUNTIME PENDING |
| Resize | 360×640 / 390×844 / desktop | VISUAL PENDING |
| Repeated sessions | 20 rounds | RUNTIME/PERF PENDING |
| Accessibility | reduced motion / keyboard-only | HUMAN PENDING |
| Supabase | schema + Netlify Function deployment | DEPLOYMENT PENDING |


## 0.2.2 Room Discovery UX gate
- PASS_SINTAXIS / Node, TS/TSX parser, temporary semantic React stubs.
- PASS_RUNTIME: MemoryStore and localhost HTTP flow including private room.
- PASS_LAYOUT_FIXTURE: 320px/375px/768px/1440px without horizontal overflow, minimum 44px main controls. Fixture is not the compiled React page.
- PENDING DATABASE_RUNTIME: 0.2.2 PL/pgSQL RPC on staging, atomic join/privacy race.
- PENDING PROD_BUILD: npm EAI_AGAIN.
- PENDING VISUAL_HUMAN, GAME_FEEL_HUMAN, BROWSER_E2E and hosted performance.
