import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {handleApiRequest} from '../server/domain/api-handler.mjs';
import {resetStoreForTests} from '../server/store/index.mjs';
import {MemoryStore} from '../server/store/memory-store.mjs';

const makeRequest=(route,body)=>new Request(`http://localhost/api/${route}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
test('POST state accepts credentials in body without exposing token in URL',async()=>{
 resetStoreForTests(new MemoryStore());
 const created=await handleApiRequest(makeRequest('rooms',{visibility:'solo',language:'es',lengthMode:5,playerName:'QA'}));
 const json=JSON.parse(created.body);
 const path=`rooms/${json.room.id}/state`;
 const req=makeRequest(path,{playerId:json.player.id,token:json.player.token});
 assert.equal(req.url.includes(json.player.token),false);
 assert.equal((await handleApiRequest(req)).status,200);
});
test('Netlify without persistent backend rejects requests instead of silently losing rooms',async()=>{
 resetStoreForTests(null);
 const request=new Request('http://localhost/api/rooms');
 const result=await handleApiRequest(request,{NETLIFY:'true'});
 assert.equal(result.status,503);
 assert.equal(JSON.parse(result.body).error,'BACKEND_NOT_CONFIGURED');
});
test('tile cells contain no overlays or status glyphs',()=>{
 const code=fs.readFileSync(new URL('../src/components/GameBoard.tsx',import.meta.url),'utf8');
 const tile=code.match(/return <div key=\{c\} className=\{`tile .*?<\/div>/s)?.[0]||'';
 assert.ok(tile.includes('<span>{letter}</span>'));
 assert.equal(tile.includes('<i'),false);
});
test('screenshot export exists and includes answer and ranking',()=>{
 const code=fs.readFileSync(new URL('../src/components/Result.tsx',import.meta.url),'utf8');
 const png=fs.readFileSync(new URL('../src/game/result-export.ts',import.meta.url),'utf8');
 assert.ok(png.includes('canvas.toBlob'));
 assert.ok(png.includes('round.answer'));
 assert.ok(png.includes('state.myAttempts'));
 assert.ok(png.includes('backgrounds[mark]'));
 assert.ok(code.includes('score-row'));
 assert.ok(code.includes('result-attempt-cell'));
});
