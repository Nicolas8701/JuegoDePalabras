import { useEffect, useState } from 'react';
import type { Country, GameMode, Language, LengthMode, RoomSummary, Visibility } from '../types/api';
import { t } from '../game/i18n';
import { countryLabel, modeLabel } from '../game/modes';

interface Props {
 language:Language; onLanguage:(value:Language)=>void; playerName:string;onPlayerName:(value:string)=>void;
 busy:boolean;rooms:RoomSummary[];onRefreshRooms:()=>void;
 onCreate:(visibility:Visibility,length:LengthMode,mode:GameMode,country:Country,languageMode:'fixed'|'random')=>void;
 onJoin:(code:string)=>void;
}
const lengths:LengthMode[]=[4,5,6,7,8,'random'];
const modes:GameMode[]=['classic','culture','insults','blitz','duel'];
const countryIds:Country[]=['random','ar','es','us','mx','gb','cl'];
export function Home({language,onLanguage,playerName,onPlayerName,busy,rooms,onRefreshRooms,onCreate,onJoin}:Props) {
 const copy=t(language);
 const [screen,setScreen]=useState<'choose'|'configure'|'join'|'rooms'>('choose');
 const [visibility,setVisibility]=useState<Visibility>('solo');
 const [mode,setMode]=useState<GameMode>('classic');
 const [languageMode,setLanguageMode]=useState<'fixed'|'random'>('fixed');
 const [country,setCountry]=useState<Country>('random');
 const [length,setLength]=useState<LengthMode>('random');
 useEffect(()=>{if(visibility==='solo'&&mode==='duel')setMode('classic');},[visibility,mode]);
 const [code,setCode]=useState('');
 const [filter,setFilter]=useState<GameMode|'all'>('all');
 useEffect(()=>{if(screen==='rooms')onRefreshRooms();},[screen,onRefreshRooms]);
 const isEs=language==='es';
 const descriptions:Record<GameMode,string>=isEs?{
  classic:'Palabras comunes. Sin límite diario.',culture:'Comidas, geografía, historia y tradiciones.',
  insults:'Jerga e insultos. Contenido adulto optativo.',blitz:'Una palabra. 90 segundos para resolverla.',duel:'Solo dos jugadores. Cinco intentos.'
 }:{classic:'Everyday words. Unlimited rounds.',culture:'Food, history, geography and traditions.',
  insults:'Slang and insults. Optional adult language.',blitz:'One word. Beat the 90-second clock.',duel:'Two players. Five attempts.'};
 return <main className="home-shell">
  <header className="home-header"><span className="brand-mark">PA<span>✦</span></span><span className="eyebrow">PALABRA ARENA</span><span className="version">0.2.0 CANDIDATE</span></header>
  <section className="hero"><p className="eyebrow">{isEs?'UN JUEGO DE PALABRAS SIN LÍMITES':'UNLIMITED WORD BATTLES'}</p><h1>{isEs?'Cada palabra cuenta.':'Every word counts.'}</h1><p>{isEs?'En solitario o con amigos. Elegí cómo jugar.':'Solo or with friends. Make every guess count.'}</p></section>
  <div className="home-panel panel">
   {screen!=='choose'&&<button className="text-back" onClick={()=>setScreen('choose')}>← {isEs?'Volver':'Back'}</button>}
   {screen==='choose'&&<div className="choice-list">
    <button className="choice" onClick={()=>{setVisibility('solo');setScreen('configure')}}><span className="choice-icon">✦</span><span><strong>{isEs?'Jugar solo':'Play solo'}</strong><small>{isEs?'Rondas infinitas a tu ritmo':'Unlimited rounds, your pace'}</small></span><b>→</b></button>
    <button className="choice" onClick={()=>{setVisibility('public');setScreen('configure')}}><span className="choice-icon">◎</span><span><strong>{isEs?'Crear sala pública':'Create public room'}</strong><small>{isEs?'Jueguen en simultáneo':'Compete together in real time'}</small></span><b>→</b></button>
    <button className="choice" onClick={()=>{setVisibility('private');setScreen('configure')}}><span className="choice-icon">♢</span><span><strong>{isEs?'Crear sala privada':'Create private room'}</strong><small>{isEs?'Invitá con un código':'Invite friends with a code'}</small></span><b>→</b></button>
    <div className="choice-divider"/>
    <button className="choice compact" onClick={()=>setScreen('rooms')}><span>☷</span>{isEs?'Explorar salas públicas':'Browse public rooms'}<b>→</b></button>
    <button className="choice compact" onClick={()=>setScreen('join')}><span>⌗</span>{isEs?'Tengo un código':'I have a room code'}<b>→</b></button>
   </div>}
   {screen==='configure'&&<div className="settings-stack">
    <div className="panel-heading"><p className="eyebrow">{isEs?'CONFIGURAR PARTIDA':'GAME SETTINGS'}</p><h2>{visibility==='solo'?(isEs?'Tu partida':'Your game'):visibility==='private'?(isEs?'Sala privada':'Private room'):(isEs?'Sala pública':'Public room')}</h2></div>
    <label>{copy.name}<input maxLength={18} value={playerName} onChange={e=>onPlayerName(e.target.value)} placeholder={isEs?'Tu apodo':'Nickname'}/></label>
    <label>{copy.language}<select value={languageMode==='random'?'random':language} onChange={e=>{const next=e.target.value;if(next==='random')setLanguageMode('random');else{setLanguageMode('fixed');onLanguage(next as Language);}}}><option value="es">Español (Latinoamérica)</option><option value="en">English</option><option value="random">{isEs?'🎲 Idioma al azar por ronda':'🎲 Random language each round'}</option></select></label>
    <div className="field-block"><div className="field-label">{isEs?'Modo de juego':'Game mode'}</div><div className="mode-grid">{modes.filter(m=>visibility!=='solo'||m!=='duel').map(m=><button key={m} className={`mode-choice ${mode===m?'selected':''}`} onClick={()=>setMode(m)}><strong>{modeLabel(m,language)}</strong><small>{descriptions[m]}</small></button>)}</div></div>
    {(mode==='culture'||mode==='insults')&&<label>{isEs?'País de referencia':'Country / theme'}<select value={country} onChange={e=>setCountry(e.target.value as Country)}>{countryIds.map(c=><option key={c} value={c}>{countryLabel(c,language)}</option>)}</select></label>}
    <div className="field-block"><div className="field-label">{copy.length}</div><div className="length-row">{lengths.map(item=><button key={item} className={`chip ${length===item?'selected':''}`} onClick={()=>setLength(item)}>{item==='random'?(isEs?'Azar':'Random'):item}</button>)}</div><small className="field-note">{isEs?'Los temas tienen palabras curadas; algunas combinaciones de longitud pueden no estar disponibles.':'Themes use curated answers; some word lengths may not be available.'}</small></div>
    <button className="primary massive" disabled={busy} onClick={()=>onCreate(visibility,length,mode,country,languageMode)}>{busy?'…':isEs?'INICIAR':'START'} <span>→</span></button>
   </div>}
   {screen==='join'&&<div className="settings-stack"><h2>{isEs?'Unirse con código':'Join by code'}</h2><label>{copy.name}<input maxLength={18} value={playerName} onChange={e=>onPlayerName(e.target.value)}/></label><label>{copy.code}<input className="code-input" maxLength={5} value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))} placeholder="ABCDE"/></label><button className="primary massive" disabled={busy||code.length!==5} onClick={()=>onJoin(code)}>{copy.join} →</button></div>}
   {screen==='rooms'&&<div className="settings-stack"><div className="rooms-heading"><h2>{copy.publicRooms}</h2><button className="secondary" onClick={onRefreshRooms}>↻ {copy.refresh}</button></div><label>{isEs?'Filtrar modo':'Mode filter'}<select value={filter} onChange={e=>setFilter(e.target.value as GameMode|'all')}><option value="all">{isEs?'Todos':'All'}</option>{modes.map(m=><option key={m} value={m}>{modeLabel(m,language)}</option>)}</select></label><div className="room-list">{rooms.filter(r=>filter==='all'||r.mode===filter).map(r=><button className="room-card" key={r.id} disabled={busy} onClick={()=>onJoin(r.code)}><b>{r.code}</b><span>{modeLabel(r.mode||'classic',language)} · {r.languageMode==='random'?'ES/EN 🎲':r.language.toUpperCase()} · {countryLabel(r.country||'random',language)}</span><span>{r.playerCount}/{r.mode==='duel'?2:8} →</span></button>)}{!rooms.some(r=>filter==='all'||r.mode===filter)&&<p className="hint">{copy.noRooms}</p>}</div></div>}
  </div>
  <footer className="home-footer">{isEs?'Sin límite diario · PC y móvil':'Unlimited plays · Desktop and mobile'}</footer>
 </main>;
}
