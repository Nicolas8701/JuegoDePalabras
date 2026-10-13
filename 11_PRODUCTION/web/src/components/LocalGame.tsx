import {useEffect,useRef,useState} from 'react';
import type {Attempt,Country,GameMode,RoomState} from '../types/api';
import {chooseLocalAnswer,normalizeGuess,scoreGuess,type LocalAnswer,type LocalConfig} from '../game/local-engine';
import {GameBoard} from './GameBoard';
import {Result} from './Result';
interface Props{config:LocalConfig;playerName:string;onExit:()=>void;}
interface Round{answer:LocalAnswer;number:number;attempts:Attempt[];status:'active'|'result';startedAt:string;deadlineAt:string|null;solved:boolean;solvedAt:string|null;}
function newRound(config:LocalConfig,number:number):Round{
 return {answer:chooseLocalAnswer(config),number,attempts:[],status:'active',startedAt:new Date(Date.now()+1200).toISOString(),deadlineAt:config.mode==='blitz'?new Date(Date.now()+91200).toISOString():null,solved:false,solvedAt:null};
}
export function LocalGame({config,playerName,onExit}:Props){
 const [round,setRound]=useState<Round>(()=>newRound(config,1));
 const [reveal,setReveal]=useState(false);
 const roundRef=useRef(round);roundRef.current=round;
 const isResult=round.status==='result';
 useEffect(()=>{if(!round.deadlineAt||isResult)return;const timer=window.setInterval(()=>{if(Date.now()>=Date.parse(round.deadlineAt!))setRound(r=>r.status==='active'?{...r,status:'result'}:r);},250);return()=>clearInterval(timer);},[round.deadlineAt,isResult]);
 useEffect(()=>{setReveal(false);if(!isResult)return;const timer=window.setTimeout(()=>setReveal(true),1750);return()=>clearTimeout(timer);},[isResult,round.number]);
 const finish=()=>setRound(r=>({...r,status:'result'}));
 const guess=async(text:string):Promise<boolean>=>{
  const r=roundRef.current;if(r.status!=='active'||Date.now()<Date.parse(r.startedAt))return false;
  const normalized=normalizeGuess(text);
  if(normalized.length!==r.answer.word.length||!/^[a-zñ]+$/.test(normalized)||r.answer.language==='en'&&normalized.includes('ñ'))return false;
  const marks=scoreGuess(r.answer.word,normalized);
  const solved=marks.every(m=>m==='correct');
  const attempts=[...r.attempts,{guess:normalized,marks,rowIndex:r.attempts.length}];
  const next:Round={...r,attempts,solved,solvedAt:solved?new Date().toISOString():null,status:solved||attempts.length>=6?'result':'active'};
  roundRef.current=next;setRound(next);return true;
 };
 const attemptsCount=round.attempts.length;
 const state:RoomState={room:{id:'local',code:'LOCAL',name:'Local',visibility:'solo',language:round.answer.language,mode:config.mode,country:config.country,languageMode:config.languageMode,lengthMode:config.lengthMode,status:round.status,hostPlayerId:'local-player',playerCount:1,createdAt:round.startedAt},me:{id:'local-player',name:playerName||'Jugador'},players:[{id:'local-player',name:playerName||'Jugador',ready:true,attemptsCount,solved:round.solved,completed:isResult,solvedAt:round.solvedAt,isHost:true}],round:{id:`local-round-${round.number}`,roundNumber:round.number,language:round.answer.language,wordLength:round.answer.word.length,maxAttempts:6,status:round.status,startedAt:round.startedAt,finishDeadline:null,deadlineAt:round.deadlineAt,selectedCountry:round.answer.country as Country,hint:round.answer.hint,winnerPlayerId:round.solved?'local-player':null,answer:isResult?round.answer.word:undefined},myAttempts:round.attempts};
 const rematch=()=>{const next=newRound(config,round.number+1);roundRef.current=next;setRound(next);};
 const leave=()=>{if(window.confirm(round.answer.language==='es'?'¿Salir al menú principal?':'Return to the main menu?'))onExit();};
 if(isResult&&reveal)return <Result state={state} language={round.answer.language} busy={false} onRematch={rematch} onLeave={leave}/>;
 return <GameBoard state={state} language={round.answer.language} busy={false} terminalPreview={isResult} onGuess={guess} onForfeit={()=>{if(window.confirm(round.answer.language==='es'?'¿Rendirte?':'Give up?'))finish()}} onLeave={leave} onFinish={()=>{}}/>;
}
