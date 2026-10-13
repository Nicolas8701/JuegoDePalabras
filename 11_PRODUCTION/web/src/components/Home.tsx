import { useEffect, useRef, useState } from 'react';
import type { Country, GameMode, Language, LengthMode, RoomSummary, Visibility } from '../types/api';
import { countryLabel, modeLabel } from '../game/modes';
import {cleanPlayerName,isValidPlayerName} from '../game/profile';

type OnlineVisibility = 'public'|'private';
interface Props {
 language:Language;onLanguage:(v:Language)=>void;playerName:string;onPlayerName:(v:string)=>void;
 busy:boolean;rooms:RoomSummary[];onRefreshRooms:(quiet?:boolean)=>void;
 onCreate:(visibility:Visibility,length:LengthMode,mode:GameMode,country:Country,languageMode:'fixed'|'random',roomName:string,password?:string)=>void;
 onJoin:(code:string,password?:string)=>void;
}
const lengths:LengthMode[]=[4,5,6,7,8,'random'];
const modes:GameMode[]=['classic','culture','insults','blitz','duel'];
const countries:Country[]=['random','ar','es','us','mx','gb','cl'];
export function Home({language,onLanguage,playerName,onPlayerName,busy,rooms,onRefreshRooms,onCreate,onJoin}:Props){
 const es=language==='es';
 const [editingProfile,setEditingProfile]=useState(false);
 const [profileDraft,setProfileDraft]=useState(playerName);
 const profileReady=isValidPlayerName(playerName);
 const profileGate=!profileReady||editingProfile;
 const submitProfile=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();const cleaned=cleanPlayerName(profileDraft);if(isValidPlayerName(cleaned)){onPlayerName(cleaned);setEditingProfile(false);}};
 const [screen,setScreen]=useState<'choose'|'online'|'configure'>('choose');
 const [visibility,setVisibility]=useState<Visibility>('solo');
 const [filter,setFilter]=useState<OnlineVisibility>('public');
 const [mode,setMode]=useState<GameMode>('classic');
 const [country,setCountry]=useState<Country>('random');
 const [languageMode,setLanguageMode]=useState<'fixed'|'random'>('fixed');
 const [length,setLength]=useState<LengthMode>('random');
 const [roomName,setRoomName]=useState('');
 const [password,setPassword]=useState('');
 const [joinTarget,setJoinTarget]=useState<RoomSummary|null>(null);
 const [joinPassword,setJoinPassword]=useState('');
 const dialogRef=useRef<HTMLDivElement|null>(null);
 const [code,setCode]=useState('');
 const [selectedFilter,setSelectedFilter]=useState<GameMode|'all'>('all');
 useEffect(()=>{if(screen!=='online')return;onRefreshRooms();const timer=window.setInterval(()=>onRefreshRooms(true),8000);return()=>clearInterval(timer);},[screen,onRefreshRooms]);
 useEffect(()=>{if(!joinTarget)return;
  const keydown=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();setJoinTarget(null);return;}
   if(e.key!=='Tab'||!dialogRef.current)return;
   const items=[...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')];
   if(!items.length)return;
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[joinTarget]);
 const isValidName=visibility==='solo'||roomName.trim().length>=3;
 const isValidPassword=visibility!=='private'||(password.length>=4&&password.length<=64);
 const canSubmit=!busy&&isValidName&&isValidPassword;
 const showRoom=(r:RoomSummary)=>selectedFilter==='all'||r.mode===selectedFilter;
 const roomList=rooms.filter(r=>r.visibility===filter&&showRoom(r));
 const begin=(v:Visibility)=>{setVisibility(v);if(v==='solo'&&mode==='duel')setMode('classic');setPassword('');setScreen('configure');};
 const enter=(r:RoomSummary)=>{if(r.status!=='lobby'||busy)return;if(r.visibility==='private'){setJoinTarget(r);setJoinPassword('');}else onJoin(r.code);};
 const enterByCode=()=>{if(code.length===5){const r=rooms.find(r=>r.code===code);if(r?.visibility==='private')enter(r);else onJoin(code);}};
 return <main className="home-shell clean-home">
  <header className="home-header"><button type="button" className="profile-trigger" onClick={()=>{setProfileDraft(playerName);setEditingProfile(true);setScreen('choose')}} aria-label={es?'Editar nombre de jugador':'Edit player name'}><span className="profile-avatar" aria-hidden="true">{profileReady?playerName.charAt(0).toUpperCase():'?'}</span><span>{profileReady?playerName:(es?'Tu nombre':'Your name')}</span><span className="profile-edit" aria-hidden="true">✎</span></button><span className="eyebrow home-brand">PALABRA ARENA</span><span className="version">0.2.4 · DEV</span></header>
  {profileGate?<section className="panel profile-onboarding" aria-labelledby="profile-title"><span className="eyebrow">{es?'PASO 1 · TU PERFIL':'STEP 1 · YOUR PROFILE'}</span><h1 id="profile-title">{es?'¿Cómo te llamamos?':'What should we call you?'}</h1><p>{es?'Este apodo aparecerá en las partidas locales y online. Se guarda solo en este navegador.':'This nickname appears in local and online games. It is saved only in this browser.'}</p><form onSubmit={submitProfile}><label htmlFor="profile-name">{es?'Tu nombre de jugador':'Your player name'}</label><input autoFocus id="profile-name" autoComplete="nickname" inputMode="text" maxLength={32} value={profileDraft} onChange={e=>setProfileDraft(e.target.value)} placeholder={es?'Ej. Nico':'E.g. Alex'}/><p className="field-note">{es?'2–18 caracteres: letras, números, espacios, punto, guion o guion bajo.':'2–18 characters: letters, numbers, spaces, dot, dash or underscore.'}</p><div className="profile-actions">{profileReady&&<button type="button" className="secondary" onClick={()=>setEditingProfile(false)}>{es?'Cancelar':'Cancel'}</button>}<button className="primary" type="submit" disabled={!isValidPlayerName(cleanPlayerName(profileDraft))}>{es?'Continuar':'Continue'} →</button></div></form></section>:<>
  <section className="hero"><p className="eyebrow">{es?'PARTIDAS ILIMITADAS':'UNLIMITED ROUNDS'}</p><h1>{es?'Cada palabra cuenta.':'Every word counts.'}</h1><p>{es?'Elegí cómo querés jugar.':'Choose how you want to play.'}</p></section>
  <div className="home-panel panel">
   {screen!=='choose'&&<button type="button" className="text-back" onClick={()=>{if(screen==='configure'&&visibility!=='solo')setScreen('online');else setScreen('choose');setJoinTarget(null);}}>← {es?'Volver':'Back'}</button>}
   {screen==='choose'&&<div className="clean-entry">
    <div className="choice-list">
     <button className="choice" onClick={()=>begin('solo')}><span className="choice-icon">✦</span><span><strong>{es?'Jugar local':'Play locally'}</strong><small>{es?'Sin servidor de salas, a tu ritmo':'No room server needed'}</small></span><b>→</b></button>
     <button className="choice" onClick={()=>setScreen('online')}><span className="choice-icon">◎</span><span><strong>{es?'Jugar online':'Play online'}</strong><small>{es?'Explorar salas, crear o unirse':'Find a room, create or join'}</small></span><b>→</b></button>
    </div>
   </div>}
   {screen==='online'&&<div className="online-browser">
    <div className="panel-heading"><h2>{es?'Salas disponibles':'Available rooms'}</h2><p className="field-note">{es?'Todas las salas son visibles; las privadas necesitan contraseña.':'All rooms are visible; private rooms need a password.'}</p></div>
    <div className="privacy-tabs" role="group" aria-label={es?'Tipo de sala':'Room type'}>
     <button className={filter==='public'?'active':''} aria-pressed={filter==='public'} onClick={()=>{setFilter('public');setJoinTarget(null)}}>{es?'Públicas':'Public'}</button>
     <button className={filter==='private'?'active':''} aria-pressed={filter==='private'} onClick={()=>{setFilter('private');setJoinTarget(null)}}>{es?'Privadas · contraseña':'Private · password'}</button>
    </div>
    <div className="browser-actions"><button className="primary" disabled={busy} onClick={()=>begin(filter)}>+ {es?'Crear sala':'Create room'}</button><button className="secondary" disabled={busy} onClick={()=>onRefreshRooms()}>↻ {es?'Actualizar':'Refresh'}</button></div>
    <label className="browser-filter">{es?'Modo':'Mode'}<select value={selectedFilter} onChange={e=>setSelectedFilter(e.target.value as GameMode|'all')}><option value="all">{es?'Todos los modos':'All modes'}</option>{modes.map(m=><option key={m} value={m}>{modeLabel(m,language)}</option>)}</select></label>
    <div className="room-list" aria-live="polite">{roomList.length===0?<p className="empty-rooms">{es?'No hay salas en esta categoría. Podés crear una.':'No rooms in this category. Create one!'}</p>:roomList.map(r=><button key={r.id} className="room-card browse-room" disabled={busy||r.status!=='lobby'} onClick={()=>enter(r)}>
     <span className="room-card-main"><strong>{r.name||r.code}</strong><small>{modeLabel(r.mode||'classic',language)} · {r.languageMode==='random'?'ES / EN':r.language.toUpperCase()} · {String(r.lengthMode)==='random'?(es?'Azar':'Random'):`${r.lengthMode} ${es?'letras':'letters'}`}{['culture','insults'].includes(r.mode)?` · ${countryLabel(r.country,language)}`:''}</small></span>
     <span className="room-card-end"><span className="room-count">{r.playerCount}/{r.mode==='duel'?2:8}</span><b>{r.status==='lobby'?(r.visibility==='private'?'🔒 →':'→'):(r.status==='result'?(es?'Finalizada':'Finished'):(es?'En partida':'Playing'))}</b></span>
    </button>)}</div>
    <div className="join-code"><label>{es?'¿Tenés un código?':'Have a code?'}<input className="code-input" maxLength={5} placeholder="ABCDE" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))}/></label><button className="secondary" disabled={busy||code.length!==5} onClick={enterByCode}>{es?'Entrar':'Join'}</button></div>
   </div>}
   {screen==='configure'&&<div className="settings-stack clean-config">
    <div className="panel-heading"><p className="eyebrow">{es?'CONFIGURAR PARTIDA':'GAME SETTINGS'}</p><h2>{visibility==='solo'?(es?'Partida local':'Local game'):visibility==='private'?(es?'Crear sala privada':'Create private room'):(es?'Crear sala pública':'Create public room')}</h2></div>
    {visibility!=='solo'&&<><label>{es?'Nombre de la sala':'Room name'}<input autoFocus maxLength={40} value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder={es?'Ej.: Partida de amigos':'E.g. Friends game'}/></label>{visibility==='private'&&<label>{es?'Contraseña de la sala (4 a 64 caracteres)':'Room password (4–64 characters)'}<input type="password" autoComplete="new-password" minLength={4} maxLength={64} value={password} onChange={e=>setPassword(e.target.value)}/></label>}</>}
    <label>{es?'Idioma':'Language'}<select value={languageMode==='random'?'random':language} onChange={e=>{if(e.target.value==='random')setLanguageMode('random');else{setLanguageMode('fixed');onLanguage(e.target.value as Language)}}}><option value="es">Español (Latinoamérica)</option><option value="en">English</option><option value="random">{es?'Idioma al azar':'Random language'}</option></select></label>
    <label>{es?'Modo':'Mode'}<select value={mode} onChange={e=>setMode(e.target.value as GameMode)}>{modes.filter(m=>visibility!=='solo'||m!=='duel').map(m=><option key={m} value={m}>{modeLabel(m,language)}</option>)}</select></label>
    {(mode==='culture'||mode==='insults')&&<label>{es?'País':'Country'}<select value={country} onChange={e=>setCountry(e.target.value as Country)}>{countries.map(c=><option value={c} key={c}>{countryLabel(c,language)}</option>)}</select></label>}
    <div className="field-block"><div className="field-label">{es?'Letras':'Letters'}</div><div className="length-row">{lengths.map(n=><button className={`chip ${n===length?'selected':''}`} aria-pressed={n===length} key={n} onClick={()=>setLength(n)}>{n==='random'?(es?'Azar':'Random'):n}</button>)}</div></div>
    <button className="primary massive" disabled={!canSubmit} onClick={()=>onCreate(visibility,length,mode,country,languageMode,roomName,password)}>{busy?'…':visibility==='solo'?(es?'JUGAR':'PLAY'):(es?'CREAR SALA':'CREATE ROOM')} →</button>
   </div>}
  </div>
  {joinTarget&&<div className="modal-backdrop" role="presentation"><div ref={dialogRef} className="panel join-dialog" role="dialog" aria-modal="true" aria-labelledby="join-title"><h2 id="join-title">{joinTarget.name||joinTarget.code}</h2><p className="field-note">{es?'Esta sala requiere contraseña.':'This room requires a password.'}</p><label>{es?'Contraseña':'Password'}<input autoFocus type="password" autoComplete="off" value={joinPassword} onChange={e=>setJoinPassword(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&joinPassword)onJoin(joinTarget.code,joinPassword)}}/></label><div className="dialog-actions"><button className="secondary" onClick={()=>setJoinTarget(null)}>{es?'Cancelar':'Cancel'}</button><button className="primary" disabled={busy||!joinPassword} onClick={()=>onJoin(joinTarget.code,joinPassword)}>{es?'Unirse':'Join'}</button></div></div></div>}
  <footer className="home-footer">{es?'Sin límite diario · PC y móvil':'No daily limit · Desktop and mobile'}</footer></>}
 </main>;
}
