# Invariants

Status: APPROVED BASE + CANDIDATE IMPLEMENTATION DETAILS

APPROVED:
- no daily limit;
- ES and EN;
- public and private-code rooms;
- host chooses fixed length or Random;
- mobile-first, no critical hover-only controls;
- target word never appears in client payload before round result;
- primary online mode is simultaneous Race / Same Word;
- authoritative online actions pass through Netlify Functions backed by Supabase.

CANDIDATE in 0.1.0-dev:
- supported length range 4–8;
- maximum 8 players;
- 6 attempts;
- 15-second finish grace after first solve;
- Spanish input removes acute/diaeresis marks for comparison while preserving `ñ` as distinct;
- polling is used temporarily for state sync before approved Realtime transport is wired.
