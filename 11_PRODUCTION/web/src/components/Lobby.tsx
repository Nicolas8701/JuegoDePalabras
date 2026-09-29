import { useState } from 'react';
import type { Language, RoomState } from '../types/api';
import { t } from '../game/i18n';

interface Props { state: RoomState; language: Language; busy: boolean; onReady: (ready: boolean) => void; onStart: () => void; onLeave: () => void; }

export function Lobby({ state, language, busy, onReady, onStart, onLeave }: Props) {
  const copy = t(language);
  const [copied, setCopied] = useState(false);
  const me = state.players.find((p) => p.id === state.me.id)!;
  const isHost = me?.isHost;
  const othersReady = state.players.every((p) => p.id === state.me.id || p.ready);

  const copyCode = async () => {
    await navigator.clipboard?.writeText(state.room.code).catch(() => undefined);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };

  return <main className="game-shell">
    <header className="game-header"><button className="icon-button" onClick={onLeave}>←</button><div><span className="eyebrow">{copy.lobby}</span><strong>{state.room.code}</strong></div><button className="icon-button" onClick={copyCode}>{copied ? '✓' : '⧉'}</button></header>
    <section className="panel lobby-panel">
      <div className="room-meta"><span>{state.room.visibility === 'private' ? '🔒 ' + copy.privateRoom : '◉ ' + copy.publicRoom}</span><span>{state.room.language.toUpperCase()}</span><span>{String(state.room.lengthMode).toUpperCase()} {copy.length.toLowerCase()}</span></div>
      <div className="lobby-code"><small>{copy.code}</small><strong>{state.room.code}</strong></div>
      <div className="player-roster">
        {state.players.map((player) => <div className="player-row" key={player.id}>
          <span className={`avatar ${player.ready ? 'ready' : ''}`}>{player.name.slice(0,1).toUpperCase()}</span>
          <span className="player-name">{player.name}{player.id === state.me.id ? <em> {copy.you}</em> : ''}</span>
          {player.isHost ? <b className="host-tag">{copy.host}</b> : <span className={`ready-dot ${player.ready ? 'on' : ''}`}>{player.ready ? '✓' : '·'}</span>}
        </div>)}
      </div>
      {!isHost && <button className={`primary massive ${me?.ready ? 'ready-button' : ''}`} disabled={busy} onClick={() => onReady(!me?.ready)}>{me?.ready ? '✓ ' + copy.ready : copy.ready}</button>}
      {isHost && <button className="primary massive" disabled={busy || !othersReady} onClick={onStart}>{copy.start}<span>3…2…1</span></button>}
      {isHost && !othersReady && <p className="hint">{copy.playersNotReady}</p>}
      {!isHost && <p className="hint">{copy.waiting}</p>}
    </section>
  </main>;
}
