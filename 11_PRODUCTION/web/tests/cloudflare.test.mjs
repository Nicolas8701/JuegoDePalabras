import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.mjs';
import {hashHostedRoomPassword,verifyHostedRoomPassword} from '../server/domain/security.mjs';

const request = (path, options) => new Request('https://example.workers.dev'+path, options);

test('Worker serves frontend assets without touching the online backend', async () => {
  let called = 0;
  const res = await worker.fetch(request('/'),{ASSETS:{fetch:async(req)=>{called++;return new Response('web app');}}});
  assert.equal(await res.text(),'web app');
  assert.equal(called,1);
});

test('Worker refuses memory-backed online rooms and reports 503 even with cached test store', async () => {
  const res=await worker.fetch(request('/api/rooms'),{ASSETS:{fetch:()=>{throw Error('should not serve assets');}}});
  assert.equal(res.status,503);
  assert.equal((await res.json()).error,'BACKEND_NOT_CONFIGURED');
});

test('Worker preserves API route, method and secrets in the request body', async () => {
  const res=await worker.fetch(request('/api/health'),{});
  assert.equal(res.status,503);
  assert.equal(res.headers.get('cache-control'),'no-store');
  assert.match(res.headers.get('server-timing'),/api;dur=/);
});

test('Workers config serves API before SPA fallback and ignores secrets',()=>{
  const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
  assert.equal(config.main,'./worker/index.mjs');
  assert.equal(config.assets.not_found_handling,'single-page-application');
  assert.ok(config.assets.run_worker_first.includes('/api/*'));
  assert.ok(!JSON.stringify(config).includes('SUPABASE_SERVICE_ROLE_KEY'));
});

test('hosted room password hashes are unique, authenticated and cheap to validate',()=>{
  const pepper='0123456789abcdef0123456789abcdef';
  const one=hashHostedRoomPassword('clave123',pepper);
  const two=hashHostedRoomPassword('clave123',pepper);
  assert.match(one,/^hmac256\$/);assert.notEqual(one,two);
  assert.equal(verifyHostedRoomPassword('clave123',one,pepper),true);
  assert.equal(verifyHostedRoomPassword('clave124',one,pepper),false);
  assert.equal(verifyHostedRoomPassword('clave123',one,'different-long-secret-0123456789'),false);
});
