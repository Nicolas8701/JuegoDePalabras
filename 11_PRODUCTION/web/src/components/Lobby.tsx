import { useState } from 'react';
import type { Language, RoomState } from '../types/api';
import { t } from '../game/i18n';
import { modeLabel,countryLabel } from '../game/modes';
interface Props {state:RoomState;language:Language;busy:boolean;onReady:(ready:boolean)=>void;onStart:()=>void;onLeave:()=>void;onPrivacy:(v:'public'|'private',password?:string)=>Promise<boolean>;}
export function Lobby({state,language,busy,onReady,onStart,onLeave,onPrivacy}:Props){
 const es=language==='es',copy=t(language);
 const [editing,setEditing]=useState(false),[nextVisibility,setNextVisibility]=useState<'public'|'private'>('private'),[password,setPassword]=useState(''),[copied,setCopied]=useState(false);
 const me=state.players.find(p=>p.id===state.me.id)!;
 const isHost=me?.isHost;
 const othersReady=state.players.every(p=>p.id===state.me.id||p.ready);
 const copyCode=async()=>{try{await navigator.clipboard.writeText(state.room.code);setCopied(true);window.setTimeout(()=>setCopied(false),1500);}catch{/* not supported */}};
 const savePrivacy=async()=>{if(nextVisibility==='private'&&password.length<4)return;const ok=await onPrivacy(nextVisibility,nextVisibility==='private'?password:undefined);if(ok){setEditing(false);setPassword('');}};
 const currentPrivate=state.room.visibility==='private';
 return <main className="game-shell"><header className="game-header"><button className="icon-button" onClick={onLeave} aria-label={copy.leave}>←</button><div><span className="eyebrow">{es?'SALA ONLINE':'ONLINE ROOM'}</span><strong>{state.room.name||state.room.code}</strong></div><button className="icon-button" onClick={copyCode} aria-label={copy.copy}>{copied?'✓':'⧉'}</button></header>
  <section className="panel lobby-panel clean-lobby">
   <div className="room-meta"><span>{currentPrivate?'🔒 '+copy.privateRoom:'◉ '+copy.publicRoom}</span><span>{modeLabel(state.room.mode,language)}</span><span>{state.room.languageMode==='random'?'ES / EN':state.room.language==='es'?'Español':'English'}</span>{['culture','insults'].includes(state.room.mode)&&<span>{countryLabel(state.room.country,language)}</span>}<span>{String(state.room.lengthMode).toUpperCase()} {es?'letras':'letters'}</span></div>
   <div className="lobby-code"><small>{es?'Código para invitar':'Invite code'}</small><strong>{state.room.code}</strong></div>
   {isHost&&<div className="privacy-settings"><div className="privacy-line"><div><strong>{es?'Privacidad de la sala':'Room privacy'}</strong><small>{currentPrivate?(es?'Visible en la lista, requiere contraseña':'Visible in listing, password required'):(es?'Visible y abierta a todos':'Visible and open to everyone')}</small></div><button className="secondary" disabled={busy} onClick={()=>{setEditing(!editing);setNextVisibility(currentPrivate?'public':'private');setPassword('');}}>{es?'Cambiar':'Change'}</button></div>
    {editing&&<div className="privacy-editor"><label>{es?'Cambiar a':'Switch to'}<select value={nextVisibility} onChange={e=>setNextVisibility(e.target.value as 'public'|'private')}><option value="public">{es?'Pública':'Public'}</option><option value="private">{es?'Privada':'Private'}</option></select></label>{nextVisibility==='private'&&<label>{es?'Nueva contraseña (mín. 4 caracteres)':'New password (min. 4 characters)'}<input autoFocus type="password" minLength={4} maxLength={64} value={password} onChange={e=>setPassword(e.target.value)}/></label>}<div className="dialog-actions"><button className="secondary" onClick={()=>setEditing(false)}>{es?'Cancelar':'Cancel'}</button><button className="primary" disabled={busy||(nextVisibility==='private'&&password.length<4)} onClick={savePrivacy}>{es?'Guardar':'Save'}</button></div></div>}
   </div>}
   <div className="player-roster">{state.players.map(player=><div key={player.id} className="player-row"><span className={`avatar ${player.ready?'ready':''}`}>{player.name.slice(0,1).toUpperCase()}</span><span className="player-name">{player.name}{player.id===state.me.id?<em> {copy.you}</em>:''}</span>{player.isHost?<b className="host-tag">{copy.host}</b>:<span className={`ready-dot ${player.ready?'on':''}`}>{player.ready?'✓':'·'}</span>}</div>)}</div>
   {!isHost?<button className={`primary massive ${me?.ready?'ready-button':''}`} disabled={busy} onClick={()=>onReady(!me?.ready)}>{me?.ready?'✓ '+copy.ready:copy.ready}</button>:<button className="primary massive" disabled={busy||!othersReady} onClick={onStart}>{copy.start} →</button>}
   <p className="hint">{isHost?(!othersReady?copy.playersNotReady:es?'Podés comenzar cuando quieras.':'Ready when you are.') :copy.waiting}</p>
  </section>
 </main>;
}
