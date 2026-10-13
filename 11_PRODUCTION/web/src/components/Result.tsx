
import type {CSSProperties} from 'react';
import type {Language,RoomState} from '../types/api';
import {t} from '../game/i18n';
import {countryLabel,modeLabel} from '../game/modes';
import {saveResultCard} from '../game/result-export';

interface Props {state:RoomState;language:Language;busy:boolean;onRematch:()=>void;onLeave:()=>void;}

export function Result({state,language,busy,onRematch,onLeave}:Props) {
 const copy=t(language),round=state.round!,me=state.players.find(p=>p.id===state.me.id)!;
 const order=[...state.players].sort((a,b)=>Number(b.solved)-Number(a.solved)||
  Date.parse(a.solvedAt||'9999-01-01')-Date.parse(b.solvedAt||'9999-01-01')||a.attemptsCount-b.attemptsCount);
 const attempts=[...state.myAttempts].sort((a,b)=>a.rowIndex-b.rowIndex);
 const answer=round.answer||'';
 const cssLength={'--word-length':round.wordLength} as CSSProperties;
 return <main className="result-layout"><article className="panel result-card">
  <p className="eyebrow">PALABRA ARENA · {modeLabel(state.room.mode||'classic',language)}</p>
  <h1>{me.solved?(language==='es'?'¡Lo lograste!':'You got it!'):(language==='es'?'Ronda finalizada':'Round complete')}</h1>
  <p className="result-subtitle">{language==='es'?'La palabra era':'The answer was'}:</p>
  <div className="result-word" style={cssLength}>{answer.split('').map((letter,index)=><span key={index}>{letter.toUpperCase()}</span>)}</div>
  {(state.room.mode==='culture'||state.room.mode==='insults')&&<p className="result-country">{countryLabel(round.selectedCountry||state.room.country,language)} · {round.hint}</p>}
  <section aria-label={language==='es'?'Tus intentos y colores':'Your guesses and colors'}>
   <p className="eyebrow">{language==='es'?'TUS INTENTOS':'YOUR GUESSES'} · {attempts.length}/{round.maxAttempts}</p>
   <div className="result-attempts" style={cssLength}>{attempts.map(a=><div className="result-attempt-row" key={a.rowIndex}>{Array.from({length:round.wordLength},(_,index)=><span className={`result-attempt-cell ${a.marks[index]||''}`} key={index}>{a.guess[index]?.toUpperCase()||''}</span>)}</div>)}</div>
  </section>
  <div className="scoreboard"><p className="eyebrow">{language==='es'?'CLASIFICACIÓN':'SCOREBOARD'}</p>
   {order.map((p,index)=><div className={`score-row ${p.id===me.id?'me':''}`} key={p.id}><b>#{index+1}</b><span className="avatar">{p.name.slice(0,1).toUpperCase()}</span><strong>{p.name}</strong><span>{p.solved?`${p.attemptsCount} ${copy.attempts}`:'—'}</span></div>)}
  </div>
  <div className="result-actions"><button className="primary massive" onClick={()=>saveResultCard(state,language)}>{language==='es'?'GUARDAR CAPTURA PNG':'SAVE RESULT PNG'} <span aria-hidden="true">⇩</span></button>
   {me.isHost?<button className="secondary" disabled={busy} onClick={onRematch}>{copy.rematch} ↻</button>:<div className="waiting-card">{copy.waiting}</div>}
   <button className="ghost-button" onClick={onLeave}>{copy.leave}</button>
  </div>
 </article></main>;
}
