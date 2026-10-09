import type {CSSProperties} from 'react';
import type {Language,RoomState} from '../types/api';
import {t} from '../game/i18n';
import {countryLabel,modeLabel} from '../game/modes';
interface Props{state:RoomState;language:Language;busy:boolean;onRematch:()=>void;onLeave:()=>void;}
function saveCard(state:RoomState,language:Language){
 const round=state.round!;
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1120;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const background=ctx.createLinearGradient(0,0,1000,1120);background.addColorStop(0,'#171b38');background.addColorStop(1,'#090c18');
 ctx.fillStyle=background;ctx.fillRect(0,0,1000,1120);
 ctx.textAlign='center';ctx.fillStyle='#a5b1cf';ctx.font='bold 26px system-ui';ctx.fillText('PALABRA  ✦  ARENA',500,108);
 ctx.fillStyle='#ffffff';ctx.font='bold 64px system-ui';ctx.fillText(language==='es'?'RESULTADO':'RESULT',500,205);
 const mode=modeLabel(state.room.mode||'classic',language),country=countryLabel(round.selectedCountry||state.room.country,language);
 ctx.fillStyle='#afb9d2';ctx.font='24px system-ui';ctx.fillText(mode+'   ·   '+(language==='es'?'ESPAÑOL':'ENGLISH'),500,263);
 if(state.room.mode==='culture'||state.room.mode==='insults')ctx.fillText(country,500,307);
 const answer=round.answer?.toUpperCase()||'';const size=answer.length>7?85:104;const gap=9;const total=answer.length*size+(answer.length-1)*gap;
 for(let i=0;i<answer.length;i++){const x=(1000-total)/2+i*(size+gap),y=365;
  ctx.fillStyle='#269a78';ctx.beginPath();ctx.roundRect(x,y,size,size,14);ctx.fill();ctx.fillStyle='#fff';ctx.font=`bold ${Math.round(size*.55)}px system-ui`;ctx.fillText(answer[i],x+size/2,y+size*.7);
 }
 const you=state.players.find(p=>p.id===state.me.id);ctx.fillStyle='#fff';ctx.font='bold 38px system-ui';ctx.fillText(you?.solved?(language==='es'?'¡PALABRA DESCUBIERTA!':'WORD FOUND!'):(language==='es'?'PRÓXIMA RONDA':'NEXT ROUND'),500,560);
 ctx.fillStyle='#a8b4d0';ctx.font='26px system-ui';ctx.fillText(`${you?.attemptsCount||0}/${round.maxAttempts} ${language==='es'?'intentos':'guesses'}  ·  ${state.room.code}`,500,617);
 const order=[...state.players].sort((a,b)=>Number(b.solved)-Number(a.solved)||(Date.parse(a.solvedAt||'9999-01-01')-Date.parse(b.solvedAt||'9999-01-01')));
 let y=725;for(const [i,p] of order.slice(0,6).entries()){ctx.fillStyle=i===0?'#f4c85a':'#e6eafa';ctx.textAlign='left';ctx.font='bold 26px system-ui';ctx.fillText(`#${i+1}  ${p.name}`,170,y);ctx.textAlign='right';ctx.font='24px system-ui';ctx.fillText(p.solved?`${p.attemptsCount} ${language==='es'?'intentos':'guesses'}`:'—',835,y);y+=52;}
 ctx.textAlign='center';ctx.fillStyle='#7885a6';ctx.font='20px system-ui';ctx.fillText('PALABRA ARENA · juego de palabras',500,1055);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const file=new File([blob],'palabra-arena.png',{type:'image/png'});
  if(navigator.share&&navigator.canShare?.({files:[file]}))void navigator.share({files:[file]}).catch(()=>{const a=document.createElement('a');a.href=url;a.download='palabra-arena.png';a.click();});
  else{const a=document.createElement('a');a.href=url;a.download='palabra-arena.png';a.click();}
  window.setTimeout(()=>URL.revokeObjectURL(url),15000);
 },'image/png');
}
export function Result({state,language,busy,onRematch,onLeave}:Props){
 const copy=t(language),round=state.round!,me=state.players.find(p=>p.id===state.me.id)!;
 const order=[...state.players].sort((a,b)=>Number(b.solved)-Number(a.solved)||(Date.parse(a.solvedAt||'9999-01-01')-Date.parse(b.solvedAt||'9999-01-01'))||a.attemptsCount-b.attemptsCount);
 const answer=round.answer||'';
 return <main className="result-layout"><div className="panel result-card"><p className="eyebrow">PALABRA ARENA · {modeLabel(state.room.mode||'classic',language)}</p><h1>{me.solved?(language==='es'?'¡Lo lograste!':'You got it!'):(language==='es'?'Ronda finalizada':'Round complete')}</h1><p className="result-subtitle">{language==='es'?'La palabra era':'The answer was'}:</p>
 <div className="result-word" style={{'--word-length':answer.length} as CSSProperties}>{answer.split('').map((l,i)=><span key={i}>{l.toUpperCase()}</span>)}</div>
 {(state.room.mode==='culture'||state.room.mode==='insults')&&<div className="result-country">{countryLabel(round.selectedCountry||state.room.country,language)} · {round.hint}</div>}
 <div className="scoreboard"><p className="eyebrow">{language==='es'?'CLASIFICACIÓN':'SCOREBOARD'}</p>{order.map((p,i)=><div className={`score-row ${p.id===me.id?'me':''}`} key={p.id}><b>#{i+1}</b><span className="avatar">{p.name.slice(0,1).toUpperCase()}</span><strong>{p.name}</strong><span>{p.solved?`${p.attemptsCount} ${copy.attempts}`:'—'}</span></div>)}</div>
 <div className="result-actions"><button className="primary massive" onClick={()=>saveCard(state,language)}>{language==='es'?'GUARDAR CAPTURA PNG':'SAVE RESULT PNG'} <span>⇩</span></button>{me.isHost?<button className="secondary" disabled={busy} onClick={onRematch}>{copy.rematch} ↻</button>:<div className="waiting-card">{copy.waiting}</div>}<button className="ghost-button" onClick={onLeave}>{copy.leave}</button></div>
 </div></main>;
}
