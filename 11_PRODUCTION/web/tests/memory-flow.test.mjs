import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from '../server/store/memory-store.mjs';

 test('private room lifecycle keeps target secret until result', async () => {
  const store = new MemoryStore();
  const host = await store.createRoom({ visibility: 'private', language: 'en', lengthMode: 5, playerName: 'Host' });
  const guest = await store.joinRoom({ code: host.room.code, playerName: 'Guest' });
  await store.setReady({ roomId: host.room.id, playerId: guest.player.id, token: guest.player.token, ready: true });
  let state = await store.startRound({ roomId: host.room.id, playerId: host.player.id, token: host.player.token });
  assert.equal(state.round.status, 'active');
  assert.equal('answer' in state.round && state.round.answer !== undefined, false);

  const target = store.currentRound(host.room.id).targetWord;
  state = await store.submitGuess({ roomId: host.room.id, playerId: host.player.id, token: host.player.token, guess: target });
  assert.equal(state.players.find((p) => p.id === host.player.id).solved, true);
  const guestState = await store.getRoomState({ roomId: host.room.id, playerId: guest.player.id, token: guest.player.token });
  assert.equal(guestState.round.status, 'active');
  assert.equal(guestState.round.answer, undefined);

  await store.submitGuess({ roomId: host.room.id, playerId: guest.player.id, token: guest.player.token, guess: target });
  const result = await store.getRoomState({ roomId: host.room.id, playerId: host.player.id, token: host.player.token });
  assert.equal(result.round.status, 'result');
  assert.equal(result.round.answer, target);
  assert.equal(result.myAttempts.length, 1);
});

test('public listing excludes private rooms', async () => {
  const store = new MemoryStore();
  await store.createRoom({ visibility: 'private', language: 'es', lengthMode: 'random', playerName: 'A' });
  await store.createRoom({ visibility: 'public', language: 'es', lengthMode: 5, playerName: 'B' });
  const rooms = await store.listPublicRooms();
  assert.equal(rooms.length, 1);
  assert.equal(rooms[0].visibility, 'public');
});
