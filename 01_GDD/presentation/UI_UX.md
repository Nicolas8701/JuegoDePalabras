# UI_UX

Status: CANDIDATE

## Home
Hero compacta + botones grandes: `JUGAR`, `UNIRSE CON CÓDIGO`, `SALAS PÚBLICAS`, idioma visible.

## Board feedback
- key press: 70–100 ms compression/pop;
- letter entry: tile pop 120–160 ms;
- invalid guess: horizontal shake + soft error sound;
- submit accepted: reveal tile-by-tile ~90 ms stagger;
- correct word: board pulse + particles/confetti light + short chord;
- near miss / last attempt: subtle tension cue, never blocking input.

## Multiplayer HUD
- chips/avatars with player name + row progress only;
- no remote letters/colors before round end;
- reconnect banner non-modal;
- rematch CTA appears immediately after result.

## Accessibility
- symbols in addition to color states;
- reduced-motion mode replaces flips/shakes with opacity/scale changes;
- mute sound, mute haptics, high contrast;
- full keyboard navigation.


## 0.2.2 progressive navigation — CANDIDATE
Home offers **Local** and **Online** only. Online displays discoverable Public/Private tabs, create CTA, quiet optional mode filter and optional code entry. Joining a private listing asks for password in a focused modal with Escape/Tab handling. Creating a room reveals name, password (private only), language, mode, country (themed only) and word length. Lobby shows room name/code/privacy and host-only privacy editor. Room cards display name, player count, mode, language, word length, country (themed) and joining status. Render clue tiles only as letters with colored backgrounds; no X/check overlay glyphs. Result reveal delay and PNG card remain. 320/375/768/1440 CSS fixture passed; actual React browser usability/human QA not yet done.
