import test from 'node:test';
import assert from 'node:assert/strict';
import {handleApiRequest} from '../server/domain/api-handler.mjs';
import {resetStoreForTests} from '../server/store/index.mjs';
import {MemoryStore} from '../server/store/memory-store.mjs';

test('HTTP exposes processing time separately from client network RTT',async()=>{
  resetStoreForTests(new MemoryStore());
  const r=await handleApiRequest(new Request('http://localhost/api/health'),{});
  assert.equal(r.status,200);
  assert.match(r.headers['server-timing'],/^api;dur=\d+\.\d$/);
  assert.equal(r.headers['x-palabra-arena-build'],'0.2.4-dev');
  assert.equal(JSON.parse(r.body).store,'memory');
});
