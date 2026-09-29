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
