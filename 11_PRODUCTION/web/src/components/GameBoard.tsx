import type {CSSProperties} from 'react';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Attempt,Language,Mark,RoomState} from '../types/api';
import {modeLabel,countryLabel} from '../game/modes';
import {t} from '../game/i18n';
import {useFeedback} from '../hooks/useFeedback';
interface Props{state:RoomState;language:Language;busy:boolean;onGuess:(guess:string)=>Promise<boolean>;onForfeit:()=>void;onLeave:()=>void;onFinish:()=>void;terminalPreview?:boolean;}
const rows=['QWERTYUIOP','ASDFGHJKLÑ','ZXCVBNM'];
const rank=(mark:Mark)=>mark==='correct'?3:mark==='present'?2:1;
function keyStates(attempts:Attempt[]){const map=new Map<string,Mark>();for(const a of attempts)a.guess.toUpperCase().split('').forEach((letter,i)=>{const m=a.marks[i],p=map.get(letter);if(!p||rank(m)>rank(p))map.set(letter,m);});return map;}
export function GameBoard({state,language,busy,onGuess,onForfeit,onLeave,onFinish,terminalPreview=false}:Props){
 const copy=t(language),round=state.round!;
 const [current,setCurrent]=useState(''),[shake,setShake]=useState(false),[now,setNow]=useState(Date.now()),[revealing,setRevealing]=useState<number|null>(null);
 const attemptsRef=useRef(state.myAttempts.length),submittingRef=useRef(false),{play}=useFeedback();
 const me=state.players.find(p=>p.id===state.me.id);
 const keyState=useMemo(()=>keyStates(state.myAttempts),[state.myAttempts]);
 const countdown=Math.max(0,Math.ceil((Date.parse(round.startedAt)-now)/1000));
 const secondsLeft=round.deadlineAt?Math.max(0,Math.ceil((Date.parse(round.deadlineAt)-now)/1000)):round.finishDeadline?Math.max(0,Math.ceil((Date.parse(round.finishDeadline)-now)/1000)):null;
 useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),200);return()=>clearInterval(id);},[]);
 useEffect(()=>{setCurrent('');attemptsRef.current=0;},[round.id]);
 useEffect(()=>{if(state.myAttempts.length>attemptsRef.current){const i=state.myAttempts.length-1;setRevealing(i);play(me?.solved?'win':'accept');attemptsRef.current=state.myAttempts.length;const id=window.setTimeout(()=>setRevealing(null),900);return()=>clearTimeout(id);}},[state.myAttempts.length,me?.solved,play]);
 const locked=terminalPreview||busy||Boolean(me?.completed)||countdown>0||Boolean(secondsLeft===0);
 const submit=async()=>{if(locked||submittingRef.current)return;if(current.length!==round.wordLength){setShake(true);play('error');window.setTimeout(()=>setShake(false),400);return;}
  submittingRef.current=true;
  try{const ok=await onGuess(current);if(ok)setCurrent('');else{setShake(true);play('error');window.setTimeout(()=>setShake(false),400);}}
  finally{submittingRef.current=false;}
 };
 const press=(raw:string)=>{if(locked)return;const k=raw.toUpperCase();if(k==='ENTER'){void submit();return;}if(k==='BACKSPACE'||k==='⌫'){setCurrent(v=>v.slice(0,-1));play('tap');return;}
  const normalized=k.replace(/[ÁÀÂÄ]/g,'A').replace(/[ÉÈÊË]/g,'E').replace(/[ÍÌÎÏ]/g,'I').replace(/[ÓÒÔÖ]/g,'O').replace(/[ÚÙÛÜ]/g,'U');
  if(/^[A-ZÑ]$/.test(normalized)&&(language==='es'||normalized!=='Ñ'))setCurrent(v=>v.length<round.wordLength?v+normalized:v);
 };
 const pressRef=useRef(press);pressRef.current=press;
 useEffect(()=>{const keydown=(e:KeyboardEvent)=>{const el=e.target as HTMLElement;if(['INPUT','TEXTAREA','SELECT'].includes(el?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Enter'||e.key==='Backspace'||/^[a-zA-ZñÑáéíóúüÁÉÍÓÚÜ]$/.test(e.key)){e.preventDefault();pressRef.current(e.key==='Enter'?'ENTER':e.key==='Backspace'?'BACKSPACE':e.key);}};
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[]);
 const board=Array.from({length:round.maxAttempts},(_,r)=>{const a=state.myAttempts.find(x=>x.rowIndex===r),draft=r===state.myAttempts.length?current:'';
  return <div className={`board-row ${shake&&r===state.myAttempts.length?'shake':''} ${revealing===r?'revealing':''}`} key={r}>{Array.from({length:round.wordLength},(_,c)=>{
   const letter=a?.guess[c]?.toUpperCase()??draft[c]??'',mark=a?.marks[c];
   return <div key={c} className={`tile ${mark||''} ${letter&&!mark?'filled':''}`} style={{'--i':c} as CSSProperties}><span>{letter}</span></div>;
  })}</div>;
 });
 return <main className="game-layout">
  <header className="match-topbar"><button className="icon-button" onClick={onLeave} aria-label={copy.leave}>←</button><div><b>PALABRA ARENA</b><small>{modeLabel(state.room.mode||'classic',language)} · {language==='es'?'Español (Latinoamérica)':'English'}</small></div><button className="text-button" onClick={onForfeit} disabled={terminalPreview||Boolean(me?.completed)}>{language==='es'?'Rendirme':'Give up'}</button></header>
  <section className="main-game"><div className="play-panel">
   <div className="round-subtitle"><span>{round.wordLength} {copy.length.toLowerCase()} · {language==='es'?'Ronda':'Round'} {round.roundNumber}</span><strong>{state.myAttempts.length}/{round.maxAttempts}</strong></div>
   {state.room.mode==='culture'||state.room.mode==='insults'?<div className="theme-hint"><b>{countryLabel(round.selectedCountry||state.room.country,language)}</b><span>{round.hint||modeLabel(state.room.mode,language)}</span></div>:null}
   {secondsLeft!==null&&<div className="timer-bar">{language==='es'?'Tiempo restante':'Time remaining'} <strong>{secondsLeft}s</strong></div>}
   <div className="board-wrap" style={{'--word-length':round.wordLength} as CSSProperties}>{board}</div>
   {countdown>0&&<div className="countdown" aria-live="polite">{countdown}</div>}
   {terminalPreview&&<div className="waiting-message" aria-live="polite">{language==='es'?'¡Ronda terminada! Revelando tus pistas…':'Round over! Revealing your clues…'}</div>}
   {!terminalPreview&&me?.completed&&<div className="waiting-message">{me.solved?(language==='es'?'¡Acertaste! Esperando resultado…':'Solved! Waiting for results…'):(language==='es'?'Sin intentos. Esperando resultado…':'No more attempts. Waiting for results…')}</div>}
   <div className="keyboard" aria-label={language==='es'?'Teclado del juego':'Game keyboard'}>{rows.map((row,index)=><div className="key-row" key={row}>{index===2&&<button className="key wide" disabled={locked} onClick={()=>press('ENTER')} aria-label="Enter">↵</button>}{[...row].filter(k=>language==='es'||k!=='Ñ').map(key=><button className={`key ${keyState.get(key)||''}`} key={key} disabled={locked} onClick={()=>press(key)}>{key}</button>)}{index===2&&<button className="key wide" disabled={locked} onClick={()=>press('⌫')} aria-label="Borrar">⌫</button>}</div>)}</div>
   <div className="board-legend"><span><i className="legend-dot correct"/>{language==='es'?'Exacta':'Exact'}</span><span><i className="legend-dot present"/>{language==='es'?'Otra posición':'Wrong spot'}</span><span><i className="legend-dot absent"/>{language==='es'?'No aparece':'Not present'}</span></div>
  </div><aside className="match-sidebar"><p className="eyebrow">{language==='es'?'JUGADORES':'PLAYERS'}</p><div className="roster-compact">{state.players.map(p=><div className={`roster-person ${p.id===state.me.id?'me':''}`} key={p.id}><span className="avatar">{p.name.slice(0,1).toUpperCase()}</span><strong>{p.id===state.me.id?copy.you:p.name}</strong><small>{p.solved?'✓':p.completed?'—':`${p.attemptsCount}/${round.maxAttempts}`}</small></div>)}</div><p className="hint">{language==='es'?'Las letras de tus rivales permanecen ocultas.':'Opponents’ letters stay private.'}</p>{state.players.some(p=>p.isHost&&p.id===state.me.id)&&state.room.visibility!=='solo'&&!terminalPreview&&<button className="secondary" onClick={onFinish}>{language==='es'?'Terminar ronda':'End round'}</button>}</aside></section>
 </main>;
}
