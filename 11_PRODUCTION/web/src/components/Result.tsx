import type { Language, RoomState } from '../types/api';
import { t } from '../game/i18n';

interface Props { state: RoomState; language: Language; busy: boolean; onRematch: () => void; onLeave: () => void; }
export function Result({ state, language, busy, onRematch, onLeave }: Props) {
  const copy = t(language), round = state.round!;
  const winner = state.players.find((p) => p.id === round.winnerPlayerId);
  const me = state.players.find((p) => p.id === state.me.id)!;
  const order = [...state.players].sort((a,b) => (Number(b.solved) - Number(a.solved)) || ((a.solvedAt ? Date.parse(a.solvedAt) : Infinity) - (b.solvedAt ? Date.parse(b.solvedAt) : Infinity)) || a.attemptsCount - b.attemptsCount);
  return <main className="game-shell result-shell">
    <section className="result-hero"><span className="result-kicker">{copy.answer}</span><h1>{round.answer?.toUpperCase()}</h1><p>{winner ? `${copy.winner}: ${winner.name}` : language === 'es' ? 'Esta vez nadie la resolvió.' : 'Nobody solved it this time.'}</p></section>
    <section className="panel results-panel">{order.map((p,i) => <div className={`score-row ${p.id === me.id ? 'me' : ''}`} key={p.id}><b>#{i+1}</b><span className="avatar">{p.name.slice(0,1).toUpperCase()}</span><strong>{p.name}</strong><span>{p.solved ? `✓ ${p.attemptsCount} ${copy.attempts}` : '—'}</span></div>)}</section>
    <div className="result-actions">{me.isHost ? <button className="primary massive" disabled={busy} onClick={onRematch}>{copy.rematch}<span>↻</span></button> : <div className="waiting-card">{copy.waiting}</div>}<button className="ghost-button" onClick={onLeave}>{copy.leave}</button></div>
  </main>;
}
