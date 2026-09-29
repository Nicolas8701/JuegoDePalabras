import { getWordList, normalizeWord, pickWord, SUPPORTED_LENGTHS } from '../data/words.mjs';

export function evaluateGuess(targetInput, guessInput) {
  const target = normalizeWord(targetInput);
  const guess = normalizeWord(guessInput);
  if (target.length !== guess.length) throw new Error('LENGTH_MISMATCH');

  const marks = Array(target.length).fill('absent');
  const counts = new Map();
  for (let i = 0; i < target.length; i += 1) {
    if (guess[i] === target[i]) {
      marks[i] = 'correct';
    } else {
      counts.set(target[i], (counts.get(target[i]) ?? 0) + 1);
    }
  }
  for (let i = 0; i < target.length; i += 1) {
    if (marks[i] === 'correct') continue;
    const remaining = counts.get(guess[i]) ?? 0;
    if (remaining > 0) {
      marks[i] = 'present';
      counts.set(guess[i], remaining - 1);
    }
  }
  return marks;
}

export function resolveWordLength(mode, random = Math.random) {
  if (mode === 'random') {
    return SUPPORTED_LENGTHS[Math.floor(random() * SUPPORTED_LENGTHS.length)];
  }
  const numeric = Number(mode);
  if (!SUPPORTED_LENGTHS.includes(numeric)) throw new Error('INVALID_WORD_LENGTH');
  return numeric;
}

export function chooseTarget(language, length, random = Math.random) {
  return pickWord(language, length, random);
}

export function validateGuess(language, length, guessInput) {
  const guess = normalizeWord(guessInput);
  if (guess.length !== length) return { ok: false, code: 'WRONG_LENGTH', guess };
  if (!getWordList(language, length).includes(guess)) return { ok: false, code: 'NOT_IN_DICTIONARY', guess };
  return { ok: true, guess };
}
