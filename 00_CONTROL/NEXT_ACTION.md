# NEXT ACTION

`0.1.0-dev` is a playable-source CANDIDATE awaiting human runtime/game-feel validation.

Required next step: run `START_LOCAL.bat` (Windows) or `START_LOCAL.sh`, open two browser tabs, test solo/public/private/rematch on desktop and mobile, then report any visual/input/network issues.

After that feedback, `prosigue` means: fix observed issues first, add regression coverage where applicable, then replace short polling with the approved Supabase Realtime transport without changing the authoritative API/secret-word invariant.
