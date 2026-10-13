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

## 0.2.4 Nickname + result UX — CANDIDATE
- A focused first-run nickname screen gates the two choices; rename lives at Home top-left; same name is used for Local and Online.
- Avoid forcing a login/account; localStorage is per-browser display preference, not identity/security.
- The board has at most ~56px tiles, additionally bounded by viewport height and width. Key row remains visible at 320–1365 widths.
- Reveal remains letter and color only. Results show recorded attempts in-order and PNG exports every guess with marks, target word and scoreboard.
- Keep mode/country information subtle in active UI; retain accessible legend outside tiles.
- Real React Chromium E2E includes mobile and desktop: human visual/game-feel approval still pending.

## 0.2.5 visual-cleanup CANDIDATE
- Remove marketing boilerplate, DEV badge, unnecessary profile helper instructions and personal-name examples.
- Make PALABRA ARENA the hero headline, not microscopic metadata.
- Four prominent side-by-side selectable mode cards (Classic, Culture, Insults/Jerga, Time Trial); Duel available as secondary online-only option.
- Visible flag/world-based language selection (world marker for es-419 avoids implying one nation represents Latin American Spanish).
- Primary home stays Local/Online progressive navigation and nickname editing top-left.
- Existing 0.2.4 results, keyboard, accessible external legend and Cloudflare safeguards untouched.

## 0.2.6 illustrated mode selector (CANDIDATE)
- First-class original imagery for four primary modes: classic (open book), culture (globe/landmarks), slang (comic speech bubble), time trial (hourglass). No emoji substitutes and no baked text in asset.
- Home choice screen previews selectable mode cards; selected mode persists when choosing Local or Online. Configure reuses the same cards for edits.
- Brand title is plain semantic h1, not link/button and not pointer-selectable; ◆ symbol removed from header and mode icons.
- Language controls only answer vocabulary/writing; Country controls thematic regional source (culture/slang) independently. ES-419 is multinational, so use an Americas globe instead of any particular country's flag.
- Card artworks remain CANDIDATE until human visual check, no mass asset production initiated.
