// Built-in Node only. Smoke-test the full local HTTP lifecycle and record local RTT.
// This is NOT a Netlify/Supabase latency benchmark.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';

const spare = createServer();
await new Promise((resolve,reject)=>spare.listen(0,'127.0.0.1',resolve).once('error',reject));
const port=spare.address().port;
await new Promise(resolve=>spare.close(resolve));
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['server/local-server.mjs'],{
  env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']
});
let logs='';
child.stdout.on('data',x=>logs+=x.toString());
child.stderr.on('data',x=>logs+=x.toString());
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const post=async(path,body)=>{
  const res=await fetch(`${base}${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const result=await res.json();
  if(!res.ok)throw new Error(`${path} HTTP ${res.status}: ${JSON.stringify(result)}`);
  return result;
};
try{
  let ok=false;
  for(let i=0;i<60;i++){
    if(child.exitCode!==null)throw Error(`server exited: ${logs}`);
    try{const res=await fetch(`${base}/api/health`);if(res.ok){ok=true;break;}}catch{}
    await wait(40);
  }
  assert.ok(ok,`server did not boot: ${logs}`);
  const created=await post('/api/rooms',{visibility:'solo',language:'es',lengthMode:5,playerName:'smoke',mode:'classic',country:'random',languageMode:'fixed'});
  const path=`/api/rooms/${created.room.id}`;
  const creds={playerId:created.player.id,token:created.player.token};
  let game=await post(`${path}/start`,creds);
  assert.equal(game.round.status,'active');
  assert.equal(Object.hasOwn(game.round,'answer'),false,'pre-result secret leaked');
  const samples=[];
  for(let i=0;i<40;i++){
    const start=performance.now();game=await post(`${path}/state`,creds);samples.push(performance.now()-start);
    assert.equal(Object.hasOwn(game.round,'answer'),false);
  }
  game=await post(`${path}/forfeit`,creds);
  assert.equal(game.round.status,'result');
  assert.equal(typeof game.round.answer,'string');
  game=await post(`${path}/rematch`,creds);
  assert.equal(game.room.status,'lobby');
  await post(`${path}/leave`,creds);
  const ordered=samples.sort((a,b)=>a-b);
  const percentile=p=>ordered[Math.min(ordered.length-1,Math.ceil(p*ordered.length)-1)].toFixed(2);
  console.log(JSON.stringify({status:'PASS',scope:'localhost MemoryStore only',httpStateSamples:ordered.length,localRttP50Ms:percentile(.5),localRttP95Ms:percentile(.95)},null,2));
}finally{
  child.kill('SIGTERM');
}
