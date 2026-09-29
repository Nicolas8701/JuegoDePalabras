import { useEffect, useState } from 'react';
import type { Language, LengthMode, RoomSummary, Visibility } from '../types/api';
import { t } from '../game/i18n';

interface Props {
  language: Language;
  onLanguage: (value: Language) => void;
  playerName: string;
  onPlayerName: (value: string) => void;
  busy: boolean;
  rooms: RoomSummary[];
  onRefreshRooms: () => void;
  onCreate: (visibility: Visibility, length: LengthMode) => void;
  onJoin: (code: string) => void;
}

const lengths: LengthMode[] = [4, 5, 6, 7, 8, 'random'];

export function Home({ language, onLanguage, playerName, onPlayerName, busy, rooms, onRefreshRooms, onCreate, onJoin }: Props) {
  const copy = t(language);
  const [length, setLength] = useState<LengthMode>('random');
  const [code, setCode] = useState('');
  const [tab, setTab] = useState<'play' | 'rooms'>('play');

  useEffect(() => { if (tab === 'rooms') onRefreshRooms(); }, [tab, onRefreshRooms]);

  return <main className="home-shell">
    <section className="brand-block">
      <div className="logo-grid" aria-hidden="true">
        {['P','A','L','A','B','R','A','•','A'].map((x, i) => <span key={i}>{x}</span>)}
      </div>
      <div>
        <p className="eyebrow">PALABRA ARENA</p>
        <h1>Piensa. Pulsa. <em>Gana.</em></h1>
        <p className="subtitle">{copy.subtitle}</p>
      </div>
    </section>

    <section className="panel home-panel">
      <div className="segmented top-tabs">
        <button className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}>JUGAR</button>
        <button className={tab === 'rooms' ? 'active' : ''} onClick={() => setTab('rooms')}>{copy.publicRooms}</button>
      </div>

      {tab === 'play' ? <>
        <div className="field-row two">
          <label>{copy.name}<input maxLength={18} value={playerName} onChange={(e) => onPlayerName(e.target.value)} placeholder={language === 'es' ? 'Jugador' : 'Player'} /></label>
          <label>{copy.language}<select value={language} onChange={(e) => onLanguage(e.target.value as Language)}><option value="es">Español</option><option value="en">English</option></select></label>
        </div>

        <div className="field-block">
          <span className="field-label">{copy.length}</span>
          <div className="length-row">
            {lengths.map((item) => <button key={item} className={`chip ${length === item ? 'selected' : ''}`} onClick={() => setLength(item)}>{item === 'random' ? copy.random : item}</button>)}
          </div>
        </div>

        <button className="primary massive" disabled={busy} onClick={() => onCreate('solo', length)}>{copy.solo}<span>→</span></button>
        <div className="split-actions">
          <button className="secondary" disabled={busy} onClick={() => onCreate('public', length)}>{copy.createPublic}</button>
          <button className="secondary" disabled={busy} onClick={() => onCreate('private', length)}>{copy.createPrivate}</button>
        </div>

        <div className="join-strip">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0,5))} placeholder={copy.code} aria-label={copy.code} />
          <button disabled={busy || code.length < 5} onClick={() => onJoin(code)}>{copy.join}</button>
        </div>
      </> : <>
        <div className="rooms-heading"><div><strong>{copy.publicRooms}</strong><span>{rooms.length} abiertas</span></div><button className="icon-button" onClick={onRefreshRooms} aria-label={copy.refresh}>↻</button></div>
        <div className="room-list">
          {rooms.length === 0 ? <div className="empty-state">{copy.noRooms}</div> : rooms.map((room) => <button className="room-card" key={room.id} disabled={busy || room.status !== 'lobby'} onClick={() => onJoin(room.code)}>
            <span className="room-code">{room.code}</span>
            <span>{room.language.toUpperCase()} · {String(room.lengthMode).toUpperCase()}</span>
            <span>{room.playerCount}/8</span>
            <b>→</b>
          </button>)}
        </div>
      </>}
    </section>

    <footer>0.1.0-dev · Sin límite diario · Mobile first</footer>
  </main>;
}
