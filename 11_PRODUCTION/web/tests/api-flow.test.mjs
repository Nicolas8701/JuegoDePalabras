import test from 'node:test';
import assert from 'node:assert/strict';
import { handleApiRequest } from '../server/domain/api-handler.mjs';
import { MemoryStore } from '../server/store/memory-store.mjs';
import { resetStoreForTests } from '../server/store/index.mjs';

async function call(path, method = 'GET', body) {
  const request = new Request(`http://local${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const result = await handleApiRequest(request, {});
  return { status: result.status, data: JSON.parse(result.body) };
}

test('HTTP contract creates, joins, starts and hides answer', async () => {
  const store = new MemoryStore();
  resetStoreForTests(store);
  const created = await call('/api/rooms', 'POST', { visibility: 'public', language: 'es', lengthMode: 5, playerName: 'Uno' });
  assert.equal(created.status, 201);
  const code = created.data.room.code;
  const joined = await call('/api/rooms/join', 'POST', { code, playerName: 'Dos' });
  assert.equal(joined.status, 200);
  const roomId = created.data.room.id;
  await call(`/api/rooms/${roomId}/ready`, 'POST', { playerId: joined.data.player.id, token: joined.data.player.token, ready: true });
  const started = await call(`/api/rooms/${roomId}/start`, 'POST', { playerId: created.data.player.id, token: created.data.player.token });
  assert.equal(started.status, 200);
  assert.equal(started.data.round.status, 'active');
  assert.equal(started.data.round.answer, undefined);
  const serialized = JSON.stringify(started.data);
  const target = store.currentRound(roomId).targetWord;
  assert.equal(serialized.includes(target), false);
});
