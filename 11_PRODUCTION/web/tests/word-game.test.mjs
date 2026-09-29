import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGuess, resolveWordLength, validateGuess } from '../server/domain/word-game.mjs';

 test('duplicate letters are consumed correctly', () => {
  assert.deepEqual(evaluateGuess('carta', 'tarta'), ['absent','correct','correct','correct','correct']);
  assert.deepEqual(evaluateGuess('apple', 'allee'), ['correct','present','absent','absent','correct']);
});

test('supported lengths accept fixed or random', () => {
  assert.equal(resolveWordLength(5), 5);
  assert.equal(resolveWordLength('random', () => 0), 4);
  assert.throws(() => resolveWordLength(9));
});

test('dictionary validation normalizes accents but keeps ñ distinct', () => {
  assert.equal(validateGuess('es', 7, 'MONTAÑA').ok, true);
  assert.equal(validateGuess('es', 7, 'montana').ok, false);
  assert.equal(validateGuess('en', 5, 'APPLE').ok, true);
});
