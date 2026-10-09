import test from 'node:test';
import assert from 'node:assert/strict';
import {getPack,getPackStats} from '../server/data/modes.mjs';
import {resolveRoundConfig,validateGuess} from '../server/domain/word-game.mjs';
import {getFullWordList} from '../server/data/words.mjs';
import {MemoryStore} from '../server/store/memory-store.mjs';
const auth=(room,player)=>({roomId:room.id,playerId:player.id,token:player.token});
test('every culture country-language has curated answers and correct locale',()=>{
 const stats=getPackStats();
 for(const country of ['ar','es','us','mx','gb','cl'])for(const lang of ['es','en']){
  assert.ok(stats.culture[lang][country]>=12,`${country}-${lang}`);
  const pack=getPack('culture',lang,country);
  assert.ok(pack.every(e=>e.country===country&&e.language===lang&&/^[a-zñ]{4,8}$/.test(e.word)));
 }
});
test('culture, insults and general answer pools independent from guess validation',()=>{
 for(const lang of ['es','en'])for(const length of [4,5,6,7,8])assert.ok(getFullWordList(lang,length).length>=35);
 assert.equal(validateGuess('es',4,'TUYO').ok,true);
 assert.equal(validateGuess('es',8,'SOPENCOS').ok,true);
 assert.equal(validateGuess('es',8,'S0PENCOS').ok,false);
 assert.equal(validateGuess('en',4,'NIÑO').ok,false);
 assert.notEqual(resolveRoundConfig('es',4,'culture','mx',()=>0).targetWord.length,0);
 assert.equal(resolveRoundConfig('en','random','insults','gb',()=>0).selectedCountry,'gb');
});
test('private session remains secret in themed mode, correct country exposed',async()=>{
 const s=new MemoryStore(),{room,player}=await s.createRoom({visibility:'solo',language:'es',lengthMode:'random',mode:'culture',country:'cl',playerName:'A'});
 let state=await s.startRound(auth(room,player));
 assert.equal(state.room.mode,'culture');assert.equal(state.round.selectedCountry,'cl');assert.equal(state.round.answer,undefined);
 await assert.rejects(()=>s.submitGuess({...auth(room,player),guess:'a'.repeat(state.round.wordLength)}),{code:'COUNTDOWN_ACTIVE'});
 const target=s.currentRound(room.id).targetWord;s.currentRound(room.id).startedAt=new Date(Date.now()-5).toISOString();
 state=await s.submitGuess({...auth(room,player),guess:target});
 assert.equal(state.round.status,'result');assert.equal(state.round.answer,target);
});
test('forfeit, leave, transfer host and round finish are server actions',async()=>{
 const s=new MemoryStore(),host=await s.createRoom({visibility:'public',language:'es',lengthMode:5,mode:'duel',playerName:'H'});
 const guest=await s.joinRoom({code:host.room.code,playerName:'G'});
 await assert.rejects(()=>s.joinRoom({code:host.room.code,playerName:'T'}),{code:'ROOM_FULL'});
 await s.setReady({...auth(host.room,guest.player),ready:true});
 await s.startRound(auth(host.room,host.player));
 const after=await s.forfeit(auth(host.room,host.player));assert.equal(after.players[0].completed,true);
 await s.finishRound(auth(host.room,host.player));
 await s.leaveRoom(auth(host.room,host.player));
 const remaining=await s.getRoomState(auth(host.room,guest.player));assert.equal(remaining.players[0].isHost,true);
});

test('general content is meaningfully expanded for both languages',()=>{
 for(const lang of ['es','en']){
  assert.ok(getFullWordList(lang,5).length>170);
  assert.ok(getFullWordList(lang,8).length>150);
 }
});
test('culture answers and insults cannot leak into one another through mode selection',()=>{
 const a=resolveRoundConfig('es','random','culture','ar',()=>0);
 const b=resolveRoundConfig('es','random','insults','ar',()=>0);
 assert.ok(getPack('culture','es','ar').some(x=>x.word===a.targetWord));
 assert.ok(getPack('insults','es','ar').some(x=>x.word===b.targetWord));
});
test('random country resolves to a country-backed culturally themed word',()=>{
 for(const lang of ['es','en']){
  const a=resolveRoundConfig(lang,'random','culture','random',()=>0.42);
  assert.notEqual(a.selectedCountry,'random');
  assert.ok(['ar','es','us','mx','gb','cl'].includes(a.selectedCountry));
 }
});
test('fixed country with missing word length fails clearly (no unrelated fallback)',()=>{
 assert.throws(()=>resolveRoundConfig('en',8,'insults','ar',()=>0),{code:'NO_CONTENT_FOR_SELECTION'});
});
test('random language selection respects one target language each round',async()=>{
 const s=new MemoryStore();const {room,player}=await s.createRoom({visibility:'solo',language:'es',languageMode:'random',mode:'culture',country:'mx',lengthMode:'random',playerName:'a'});
 const state=await s.startRound(auth(room,player));
 assert.equal(state.room.languageMode,'random');
 assert.ok(['es','en'].includes(state.round.language));
 assert.equal(state.round.selectedCountry,'mx');
});
test('speed mode enforces its authoritative deadline',async()=>{
 const s=new MemoryStore();const {room,player}=await s.createRoom({visibility:'solo',language:'en',lengthMode:5,mode:'blitz',playerName:'a'});
 const state=await s.startRound(auth(room,player));
 assert.ok(Date.parse(state.round.deadlineAt)>Date.parse(state.round.startedAt));
 s.currentRound(room.id).deadlineAt=new Date(Date.now()-1).toISOString();
 const result=await s.getRoomState(auth(room,player));assert.equal(result.round.status,'result');
});
test('duel cannot begin with one player and never exceeds two players',async()=>{
 const s=new MemoryStore();const {room,player}=await s.createRoom({visibility:'public',language:'es',lengthMode:5,mode:'duel',playerName:'a'});
 await assert.rejects(()=>s.startRound(auth(room,player)),{code:'NEED_TWO_PLAYERS'});
 const guest=await s.joinRoom({code:room.code,playerName:'b'});
 await s.setReady({...auth(room,guest.player),ready:true});
 assert.equal((await s.startRound(auth(room,player))).round.maxAttempts,5);
});
test('host leaving is a persistent server action and final exit closes room',async()=>{
 const s=new MemoryStore();const host=await s.createRoom({visibility:'private',language:'en',lengthMode:5,playerName:'a'});
 const guest=await s.joinRoom({code:host.room.code,playerName:'b'});
 await s.leaveRoom(auth(host.room,host.player));
 const state=await s.getRoomState(auth(host.room,guest.player));
 assert.equal(state.room.hostPlayerId,guest.player.id);
 await s.leaveRoom(auth(host.room,guest.player));
 await assert.rejects(()=>s.joinRoom({code:host.room.code,playerName:'c'}),{code:'ROOM_NOT_FOUND'});
});
