import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {MemoryStore} from '../server/store/memory-store.mjs';
import {handleApiRequest} from '../server/domain/api-handler.mjs';
import {resetStoreForTests} from '../server/store/index.mjs';
import {hashRoomPassword, verifyRoomPassword} from '../server/domain/security.mjs';
const auth=({room,player})=>({roomId:room.id,playerId:player.id,token:player.token});
const input=(visibility='public',password)=>({visibility,roomName:'Los Genios',playerName:'Host',language:'es',lengthMode:5,mode:'classic',password});
const call=async(path,method='GET',body)=>{const res=await handleApiRequest(new Request(`http://localhost${path}`,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined}),{});return{status:res.status,body:JSON.parse(res.body)};};

test('salted hashes never equal raw passwords and verify in constant-time comparison',()=>{
 const a=hashRoomPassword('clave123'),b=hashRoomPassword('clave123');
 assert.notEqual(a,b);assert.ok(a.startsWith('scrypt$'));
 assert.equal(verifyRoomPassword('clave123',a),true);
 assert.equal(verifyRoomPassword('clave124',a),false);
 assert.equal(verifyRoomPassword('',a),false);
});

test('public and password-protected private rooms appear by name without leaking secrets',async()=>{
 const s=new MemoryStore();const a=await s.createRoom(input());const b=await s.createRoom(input('private','password49'));
 const listing=await s.listPublicRooms();
 assert.equal(listing.length,2);
 assert.ok(listing.every(r=>r.name==='Los Genios'));
 assert.deepEqual(new Set(listing.map(r=>r.visibility)),new Set(['public','private']));
 const exposed=JSON.stringify(listing);
 assert.ok(!exposed.includes('password49')&&!exposed.includes('scrypt$')&&!exposed.includes('passwordHash'));
 await assert.rejects(s.joinRoom({code:b.room.code,playerName:'Guest'}),{code:'INVALID_ROOM_PASSWORD'});
 await assert.rejects(s.joinRoom({code:b.room.code,playerName:'Guest',password:'bad'}),{code:'INVALID_ROOM_PASSWORD'});
 const guest=await s.joinRoom({code:b.room.code.toLowerCase(),playerName:'Guest',password:'password49'});
 assert.equal(guest.room.id,b.room.id);
 assert.equal(guest.room.visibility,'private');
 assert.equal((await s.joinRoom({code:a.room.code,playerName:'Other'})).room.visibility,'public');
});

test('host switches public-private-public, room and existing members persist',async()=>{
 const s=new MemoryStore();const h=await s.createRoom(input());const guest=await s.joinRoom({code:h.room.code,playerName:'Guest'});
 const id=h.room.id;
 await s.updateRoomPrivacy({...auth(h),visibility:'private',password:'claveNueva'});
 assert.equal((await s.listPublicRooms()).find(r=>r.id===id).visibility,'private');
 await assert.rejects(s.joinRoom({code:h.room.code,playerName:'New'}),{code:'INVALID_ROOM_PASSWORD'});
 assert.equal((await s.getRoomState(auth(guest))).players.length,2);
 const added=await s.joinRoom({code:h.room.code,playerName:'New',password:'claveNueva'});
 assert.equal(added.room.id,id);
 await s.updateRoomPrivacy({...auth(h),visibility:'public'});
 assert.equal(s.rooms.get(id).passwordHash,null);
 assert.equal((await s.joinRoom({code:h.room.code,playerName:'Other'})).room.visibility,'public');
 assert.equal((await s.getRoomState(auth(guest))).players.length,4);
});

test('only active host can change room visibility; closing a room removes it from listing',async()=>{
 const s=new MemoryStore();const h=await s.createRoom(input());const guest=await s.joinRoom({code:h.room.code,playerName:'Guest'});
 await assert.rejects(s.updateRoomPrivacy({...auth(guest),visibility:'private',password:'secret'}),{code:'HOST_ONLY'});
 await assert.rejects(s.updateRoomPrivacy({...auth(h),visibility:'private',password:'x'}),{code:'PASSWORD_LENGTH'});
 await s.leaveRoom(auth(h));
 assert.equal((await s.getRoomState(auth(guest))).room.hostPlayerId,guest.player.id);
 await s.updateRoomPrivacy({...auth(guest),visibility:'private',password:'secret'});
 await s.leaveRoom(auth(guest));
 assert.equal((await s.listPublicRooms()).length,0);
});

test('all online room statuses appear in discovery but joined matches reject late entry',async()=>{
 const s=new MemoryStore();const h=await s.createRoom(input());
 let rooms=await s.listPublicRooms();assert.equal(rooms[0].status,'lobby');
 await s.startRound(auth(h));
 rooms=await s.listPublicRooms();assert.equal(rooms[0].status,'active');
 await assert.rejects(s.joinRoom({code:h.room.code,playerName:'Late'}),{code:'ROUND_ALREADY_STARTED'});
 await s.finishRound(auth(h));
 rooms=await s.listPublicRooms();assert.equal(rooms[0].status,'result');
});

test('API privacy change verifies host token and protects the room password',async()=>{
 resetStoreForTests(new MemoryStore());
 const h=await call('/api/rooms','POST',input());
 assert.equal(h.status,201);
 const args={playerId:h.body.player.id,token:h.body.player.token,visibility:'private',password:'clave-9090'};
 const id=h.body.room.id;
 const unauthorized=await call(`/api/rooms/${id}/privacy`,'POST',{...args,token:'bad-token'});
 assert.equal(unauthorized.status,401);
 const updated=await call(`/api/rooms/${id}/privacy`,'POST',args);
 assert.equal(updated.status,200);assert.equal(updated.body.room.visibility,'private');
 const listed=await call('/api/rooms');assert.equal(listed.status,200);
 assert.equal(listed.body.rooms.find(r=>r.id===id).visibility,'private');
 assert.ok(!JSON.stringify(listed.body).includes('clave-9090'));
 const denied=await call('/api/rooms/join','POST',{code:h.body.room.code,playerName:'Nope',password:'wrong'});
 assert.equal(denied.status,403);
 const allowed=await call('/api/rooms/join','POST',{code:h.body.room.code,playerName:'Valid',password:'clave-9090'});
 assert.equal(allowed.status,200);
});

test('Supabase 0.2.2 SQL requires row locks, service role and no password in public state',()=>{
 const sql=readFileSync(new URL('../supabase/0.2.2_room_discovery.sql',import.meta.url),'utf8');
 assert.match(sql,/add column if not exists password_hash text/);
 assert.match(sql,/pa_join_room_v2[\s\S]*for update[\s\S]*v_room\.password_hash is distinct from p_expected_password_hash/);
 assert.match(sql,/pa_change_privacy_v2[\s\S]*host_player_id<>p_player_id/);
 assert.match(sql,/grant execute on function public\.pa_join_room_v2[\s\S]*service_role/);
 assert.match(sql,/return jsonb_set\(v_state,'\{room,name\}'/);
 const client=readFileSync(new URL('../src/api/client.ts',import.meta.url),'utf8');
 assert.match(client,/\/privacy/);
 assert.ok(!client.includes('passwordHash'));
});

test('offline packs are bundled and the no-server local engine reuses clean tiles',()=>{
 const home=readFileSync(new URL('../src/components/Home.tsx',import.meta.url),'utf8');
 const local=readFileSync(new URL('../src/components/LocalGame.tsx',import.meta.url),'utf8');
 const engine=readFileSync(new URL('../src/game/local-engine.ts',import.meta.url),'utf8');
 const packs=JSON.parse(readFileSync(new URL('../src/game/local-packs.json',import.meta.url),'utf8'));
 for(const lang of ['es','en'])for(const len of [4,5,6,7,8])assert.ok(packs.classic[lang][len].length>=20,`${lang}/${len}`);
 assert.match(home,/Jugar local/);
 assert.match(home,/Jugar online/);
 assert.match(local,/GameBoard/);assert.match(engine,/local-packs\.json/);
 assert.ok(!local.includes('getState(')&&!local.includes('fetch('));
});

test('local runtime resolves ES/EN words and duplicate-letter marks without any HTTP',async()=>{
 const ts=await import('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
 const source=readFileSync(new URL('../src/game/local-engine.ts',import.meta.url),'utf8');
 const transformed=ts.default.transpileModule(source,{compilerOptions:{module:ts.default.ModuleKind.CommonJS,esModuleInterop:true,target:ts.default.ScriptTarget.ES2022}});
 const exports={};const packs=JSON.parse(readFileSync(new URL('../src/game/local-packs.json',import.meta.url),'utf8'));
 new Function('require','exports',transformed.outputText)(()=>packs,exports);
 assert.equal(exports.normalizeGuess('TÚYO'),'tuyo');
 assert.equal(exports.normalizeGuess('NIÑO'),'niño');
 assert.deepEqual(exports.scoreGuess('casa','aaaa'),['absent','correct','absent','correct']);
 for(const language of ['es','en'])for(const country of ['ar','es','us','mx','gb','cl']){
   const config={mode:'culture',country,language,languageMode:'fixed',lengthMode:'random'};
   const chosen=exports.chooseLocalAnswer(config,()=>0);
   assert.equal(chosen.language,language);assert.equal(chosen.country,country);
   assert.ok(chosen.word.length>=4 && chosen.word.length<=8);
 }
 for(const mode of ['classic','culture','insults']){
   const choice=exports.chooseLocalAnswer({mode,language:'es',languageMode:'fixed',country:'random',lengthMode:'random'},()=>.5);
   assert.ok(choice.word && choice.word.length>=4 && choice.word.length<=8);
 }
});

test('browser list does not store passwords and deliberately avoids clutter',()=>{
 const home=readFileSync(new URL('../src/components/Home.tsx',import.meta.url),'utf8');
 assert.match(home,/setScreen\('online'\)/);
 assert.match(home,/setFilter\('private'\)/);
 assert.match(home,/role="dialog" aria-modal="true"/);
 assert.match(home,/password.*?joinPassword/);
 assert.match(home,/Escape/);
 assert.ok(!home.includes('localStorage.setItem'));
 assert.match(home,/minLength=\{4\}/);
});
