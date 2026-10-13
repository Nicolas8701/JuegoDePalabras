import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createRoom,getState,joinRoom,listRooms,rematch,setReady,startRound,submitGuess,forfeit,finishRound,leaveRoom,changePrivacy,ApiError} from './api/client';
import {Home} from './components/Home';
import {LocalGame} from './components/LocalGame';
import {chooseLocalAnswer} from './game/local-engine';
import {Lobby} from './components/Lobby';
import {GameBoard} from './components/GameBoard';
import {Result} from './components/Result';
import {t} from './game/i18n';
import {cleanPlayerName,readPlayerName,savePlayerName} from './game/profile';
import type {Country,GameMode,Language,LengthMode,RoomState,RoomSummary,Session,Visibility} from './types/api';

const SESSION_KEY='palabra:session',LANG_KEY='palabra:language';
function loadSession():Session|null{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}}
export function App(){
 const [language,setLanguageState]=useState<Language>(()=>localStorage.getItem(LANG_KEY)==='en'?'en':'es');
 const [playerName,setPlayerNameState]=useState(readPlayerName);
 const [localConfig,setLocalConfig]=useState<{mode:GameMode;country:Country;languageMode:'fixed'|'random';language:Language;lengthMode:LengthMode}|null>(null);
 const [session,setSession]=useState<Session|null>(loadSession);
 const [state,setState]=useState<RoomState|null>(null);
 const [rooms,setRooms]=useState<RoomSummary[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [online,setOnline]=useState(true);
 const [resultVisible,setResultVisible]=useState(false);
 const sessionRef=useRef<Session|null>(session),pendingRef=useRef<string|null>(null),mutationRef=useRef(false),opRef=useRef(0),failedPollsRef=useRef(0);
 const copy=useMemo(()=>t(language),[language]);
 const sessionId=(s:Session|null)=>s?`${s.roomId}/${s.playerId}/${s.token}`:'';
 const persistSession=(next:Session|null)=>{sessionRef.current=next;opRef.current++;failedPollsRef.current=0;setSession(next);setState(null);if(next)localStorage.setItem(SESSION_KEY,JSON.stringify(next));else localStorage.removeItem(SESSION_KEY);};
 const setLanguage=(lang:Language)=>{setLanguageState(lang);localStorage.setItem(LANG_KEY,lang);};
 const setPlayerName=(v:string)=>{const clean=cleanPlayerName(v);setPlayerNameState(clean);savePlayerName(clean);};
 const translateError=useCallback((err:unknown)=>{
  const code=err instanceof ApiError?err.code:'UNKNOWN';const isEs=language==='es';
  const messages:Record<string,string>={WRONG_LENGTH:copy.wrongLength,PLAYERS_NOT_READY:copy.playersNotReady,
   ROOM_NOT_FOUND:copy.roomNotFound,ROOM_FULL:copy.roomFull,NO_CONTENT_FOR_SELECTION:isEs?'No hay respuestas de ese largo para este tema. Elegí otra longitud o Azar.':'No answers of that length in this pack. Try Random.',
   NEED_TWO_PLAYERS:isEs?'El duelo necesita exactamente dos jugadores.':'Quick duel requires exactly two players.',
   COUNTDOWN_ACTIVE:isEs?'Esperá la cuenta regresiva.':'Wait for the countdown.',
   INVALID_ROOM_PASSWORD:isEs?'Contraseña incorrecta.':'Incorrect password.',PASSWORD_LENGTH:isEs?'Usá una contraseña de 4 a 64 caracteres.':'Password must have 4–64 characters.',
   ROOM_CHANGED:isEs?'La privacidad de esta sala cambió. Actualizá la lista.':'Room privacy changed. Refresh the list.',
   INVALID_VISIBILITY:isEs?'Elegí pública o privada.':'Choose public or private.',
   ROOM_NOT_EDITABLE:isEs?'Esta sala ya no permite cambios.':'This room can no longer be changed.',
   ROOM_CODE_COLLISION:isEs?'No se pudo generar un código único. Probá otra vez.':'Could not generate a unique code. Try again.',
   UNAUTHORIZED_PLAYER:isEs?'Esta sesión ya no es válida.':'This session is no longer valid.',
   INVALID_LETTERS:isEs?'Usá solo letras del idioma.':'Use letters from the chosen language.',
   BACKEND_NOT_CONFIGURED:isEs?'El modo online necesita configurar Supabase en Cloudflare. El modo local funciona sin servidor.':'Online rooms need Supabase configured on Cloudflare. Local play works without a server.',DB_MIGRATION_REQUIRED:isEs?'Falta ejecutar la migración de la base de datos 0.2.1.':'Database migration 0.2.1 is required.',ROUND_EXPIRED:isEs?'El tiempo de la ronda terminó.':'The round has expired.'};
  return messages[code]??copy.genericError;
 },[copy,language]);
 const refreshState=useCallback(async(s:Session,silent=true)=>{
  const key=sessionId(s);if(pendingRef.current===key||mutationRef.current)return;pendingRef.current=key;const epoch=opRef.current;
  try{const next=await getState(s);
   if(epoch!==opRef.current||key!==sessionId(sessionRef.current))return;
   setState(next);failedPollsRef.current=0;setOnline(true);if(next.room.languageMode!=='random')setLanguage(next.room.language);
   if(!silent)setError(null);
  }catch(err){if(epoch!==opRef.current||key!==sessionId(sessionRef.current))return;
   failedPollsRef.current++;setOnline(false);if(!silent)setError(translateError(err));
   // An intermittent 404 never clears the session. Let the user explicitly leave.
  }finally{if(pendingRef.current===key)pendingRef.current=null;}
 },[translateError]);
 useEffect(()=>{if(session)void refreshState(session,false);},[session,refreshState]);
 useEffect(()=>{if(!session)return;
  let cancelled=false;let timeout:number;
  const tick=async()=>{if(cancelled)return;if(document.visibilityState==='visible')await refreshState(session);
   if(!cancelled) {
    // One small RPC per poll. Faster during active competition, slower in idle rooms;
    // exponential backoff prevents repeated 503/404 floods during outages.
    const normalDelay=state?.room.status==='active'?700:state?.room.status==='lobby'?1250:2400;
    const delay=failedPollsRef.current?Math.min(16000,1200*2**Math.min(4,failedPollsRef.current)):normalDelay;
    timeout=window.setTimeout(tick,delay);
   }
  };
  timeout=window.setTimeout(tick,1050);
  const visible=()=>{if(document.visibilityState==='visible')void refreshState(session);};
  window.addEventListener('visibilitychange',visible);
  return()=>{cancelled=true;clearTimeout(timeout);window.removeEventListener('visibilitychange',visible);};
 },[session,refreshState,state?.room.status]);
 const action=async(fn:()=>Promise<RoomState|void>,s=sessionRef.current)=>{
  mutationRef.current=true;setBusy(true);setError(null);const epoch=++opRef.current;
  try{const next=await fn();if(next&&epoch===opRef.current&&sessionId(s)===sessionId(sessionRef.current))setState(next);return true;}
  catch(err){setError(translateError(err));return false;}finally{setBusy(false);mutationRef.current=false;}
 };
 const onCreate=async(visibility:Visibility,lengthMode:LengthMode,mode:GameMode,country:Country,languageMode:'fixed'|'random',roomName:string,password?:string)=>{
  if(visibility==='solo'){
   const config={mode,country,languageMode,language,lengthMode};
   try{for(const lang of languageMode==='random'?(['es','en'] as const):([language] as const))chooseLocalAnswer({...config,language:lang,languageMode:'fixed'},()=>0);}
   catch{setError(language==='es'?'No hay respuestas para esa combinación de modo, país y letras. Elegí otra longitud o Azar.':'No answers for this combination of mode, country and length. Choose another length or Random.');return;}
   setError(null);setLocalConfig(config);return;}
  setBusy(true);setError(null);
  try{const next=await createRoom({visibility,language,lengthMode,mode,country,languageMode,playerName,roomName,password});setPlayerName(next.playerName);persistSession(next);
   setState(await getState(next));
  }catch(err){setError(translateError(err));}finally{setBusy(false);mutationRef.current=false;}
 };
 const onJoin=async(code:string,password?:string)=>{setBusy(true);setError(null);try{const next=await joinRoom(code,playerName,password);persistSession(next);setState(await getState(next));}catch(err){setError(translateError(err));}finally{setBusy(false);}};
 const refreshRooms=useCallback(async(quiet=false)=>{try{setRooms(await listRooms());}catch(err){if(!quiet)setError(translateError(err));}},[translateError]);
 const onPrivacy=async(visibility:'public'|'private',password?:string):Promise<boolean>=>{const current=sessionRef.current;return current?await action(()=>changePrivacy(current,visibility,password)):false;};
 const leave=async()=>{const s=sessionRef.current;if(!s)return;persistSession(null);setError(null);try{await leaveRoom(s);}catch{ /* session discarded intentionally; never block exit */ }};
 const actForfeit=()=>{if(session&&window.confirm(language==='es'?'¿Rendirte?':'Give up?'))void action(()=>forfeit(session));};
 const actFinish=()=>{if(session&&window.confirm(language==='es'?'¿Terminar esta ronda para todos?':'End round for everyone?'))void action(()=>finishRound(session));};
 useEffect(()=>{setResultVisible(false);if(state?.room.status!=='result')return;
  const id=window.setTimeout(()=>setResultVisible(true),1750);return()=>clearTimeout(id);
 },[state?.round?.id,state?.room.status]);
 const isResult=state?.room.status==='result'&&state.round;
 return <div className="app-root"><div className="ambient a1"/><div className="ambient a2"/>
 {error&&<div className="toast" role="alert"><span>!</span><p>{error}</p><button onClick={()=>setError(null)} aria-label="Close">×</button></div>}
 {!online&&session&&<div className="network-warning">{language==='es'?'Reconectando… La partida sigue guardada.':'Reconnecting… Your session is preserved.'}<button onClick={()=>void refreshState(session,false)}>↻</button></div>}
 {!session&&!localConfig&&<Home language={language} onLanguage={setLanguage} playerName={playerName} onPlayerName={setPlayerName} busy={busy} rooms={rooms} onRefreshRooms={refreshRooms} onCreate={onCreate} onJoin={onJoin}/>}
 {!session&&localConfig&&<LocalGame config={localConfig} playerName={playerName} onExit={()=>setLocalConfig(null)}/>}
 {session&&!state&&<div className="loading-screen"><div className="loader"/><p>PALABRA ARENA</p><button className="ghost-button" onClick={()=>void leave()}>{copy.leave}</button></div>}
 {session&&state?.room.status==='lobby'&&<Lobby state={state} language={language} busy={busy} onReady={ready=>void action(()=>setReady(session,ready))} onStart={()=>void action(()=>startRound(session))} onLeave={()=>void leave()} onPrivacy={onPrivacy}/>}
 {session&&state?.room.status==='active'&&state.round&&<GameBoard state={state} language={state.round.language} busy={busy} onGuess={guess=>action(()=>submitGuess(session,guess))} onForfeit={actForfeit} onLeave={()=>void leave()} onFinish={actFinish}/>}
 {session&&isResult&&!resultVisible&&<GameBoard state={state} language={state.round?.language ?? language} busy={true} terminalPreview onGuess={async()=>false} onForfeit={()=>{}} onLeave={()=>void leave()} onFinish={()=>{}}/>}
 {session&&isResult&&resultVisible&&<Result state={state} language={state.round?.language ?? language} busy={busy} onRematch={()=>void action(()=>rematch(session))} onLeave={()=>void leave()}/>}
 </div>;
}
