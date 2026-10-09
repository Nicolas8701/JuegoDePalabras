import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SupabaseStore} from '../server/store/supabase-store.mjs';
import {hashToken} from '../server/domain/security.mjs';
import {getPack} from '../server/data/modes.mjs';

const sql = await readFile(new URL('../supabase/0.2.1_atomic_state.sql', import.meta.url),'utf8');

// These tests validate the wire contract. PostgreSQL transaction execution must
// still be verified against a real test database before production approval.
test('state uses one authenticated RPC, never returns client token in URL', async () => {
  const original=globalThis.fetch;
  const calls=[];
  try {
    globalThis.fetch=async (url, options) => {
      calls.push({url,options});
      return new Response(JSON.stringify({room:{id:'abc'},players:[],myAttempts:[],round:null}),{status:200});
    };
    const store=new SupabaseStore('https://example.supabase.co','server-secret');
    const state=await store.getRoomState({roomId:'r',playerId:'p',token:'raw-token'});
    assert.equal(state.room.id,'abc');
    assert.equal(calls.length,1);
    assert.equal(calls[0].url,'https://example.supabase.co/rest/v1/rpc/pa_get_room_state_v1');
    const args=JSON.parse(calls[0].options.body);
    assert.equal(args.p_token_hash,hashToken('raw-token'));
    assert.equal(calls[0].url.includes('raw-token'),false);
    assert.equal(JSON.stringify(args).includes('raw-token'),false);
    assert.equal(calls[0].options.headers.Authorization,'Bearer server-secret');
  } finally {globalThis.fetch=original;}
});

test('guess makes one atomic mutation RPC then one state RPC, no direct attempts PATCH',async()=>{
  const original=globalThis.fetch;const calls=[];
  try{
    globalThis.fetch=async(url, options)=>{
      calls.push([url,options]);
      if(url.endsWith('/pa_submit_guess_v1')) return new Response(JSON.stringify({accepted:true,rowIndex:0,solved:false}),{status:200});
      return new Response(JSON.stringify({room:{id:'room'},myAttempts:[{rowIndex:0,guess:'tuyo',marks:['absent','absent','absent','absent']}]}),{status:200});
    };
    const store=new SupabaseStore('https://example.supabase.co','service-key');
    const next=await store.submitGuess({roomId:'room',playerId:'player',token:'secret',guess:'TÚYO'});
    assert.equal(next.myAttempts[0].guess,'tuyo');
    assert.deepEqual(calls.map(c=>new URL(c[0]).pathname),['/rest/v1/rpc/pa_submit_guess_v1','/rest/v1/rpc/pa_get_room_state_v1']);
    assert.equal(JSON.parse(calls[0][1].body).p_guess,'tuyo');
    assert.match(JSON.parse(calls[0][1].body).p_request_id,/^[0-9a-f-]{36}$/i);
    assert.equal(calls.filter(c=>c[0].includes('attempts')).length,0);
  }finally{globalThis.fetch=original;}
});

test('missing RPC migration emits actionable 503, no silent old non-atomic fallback',async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async()=>new Response(JSON.stringify({code:'PGRST202',message:'No such function'}),{status:404});
    const store=new SupabaseStore('https://example.supabase.co','s');
    await assert.rejects(()=>store.getRoomState({roomId:'r',playerId:'p',token:'t'}),{code:'DB_MIGRATION_REQUIRED',status:503});
  }finally{globalThis.fetch=original;}
});

test('SQL RPC enforces service-role restriction and secret-on-result policy',()=>{
  assert.match(sql,/revoke all on function public\.pa_get_room_state_v1[\s\S]*from public, anon, authenticated/i);
  assert.match(sql,/grant execute on function public\.pa_submit_guess_v1[\s\S]*to service_role/i);
  assert.match(sql,/if v_round\.status='result' then[\s\S]*target_word/i);
  assert.match(sql,/for update/i);
  assert.match(sql,/unique\(round_id, player_id, row_index\)|v_count-1/i);
  assert.match(sql,/15 seconds/);
});

test('regional culture packs have meaningful ES/EN coverage, valid lengths and ASCII English',()=>{
  for(const country of ['ar','es','us','mx','gb','cl'])for(const lang of ['es','en']){
    const entries=getPack('culture',lang,country);
    assert.ok(entries.length>=25,`${lang}/${country} had ${entries.length}`);
    assert.ok(entries.every(x=>x.hint && new RegExp(lang==='es'?'^[a-zñ]{4,8}$':'^[a-z]{4,8}$').test(x.word)),`${lang}/${country} format`);
    assert.equal(new Set(entries.map(x=>x.word)).size,entries.length,`${lang}/${country} duplicate`);
  }
});

test('deep health detects expected 0.2.1 schema without exposing credentials',async()=>{
  const original=globalThis.fetch;
  const calls=[];
  try{
    globalThis.fetch=async(url, options)=>{
      calls.push(url);
      return new Response(JSON.stringify({schema:'0.2.1',databaseTime:'2026-10-09T10:00:00Z'}),{status:200});
    };
    const store=new SupabaseStore('https://example.supabase.co','private');
    assert.equal((await store.checkSchema()).schema,'0.2.1');
    assert.deepEqual(calls,['https://example.supabase.co/rest/v1/rpc/pa_health_v1']);
  } finally {globalThis.fetch=original;}
});

test('idempotency migration guards repeat submit tokens across retries',()=>{
 assert.match(sql,/add column if not exists client_request_id uuid/i);
 assert.match(sql,/unique index if not exists idx_attempt_client_request/i);
 assert.match(sql,/where round_id=v_round\.id and player_id=p_player_id and client_request_id=p_request_id/i);
 assert.match(sql,/return jsonb_build_object\('accepted',true,'duplicate',true\)/i);
});
