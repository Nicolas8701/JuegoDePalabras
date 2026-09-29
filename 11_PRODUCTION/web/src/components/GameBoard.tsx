import { useEffect, useMemo, useRef, useState } from 'react';
import type { Attempt, Language, Mark, RoomState } from '../types/api';
import { t } from '../game/i18n';
import { useFeedback } from '../hooks/useFeedback';

interface Props { state: RoomState; language: Language; busy: boolean; onGuess: (guess: string) => Promise<boolean>; }
const rows = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];

function keyRanks(mark: Mark) { return mark === 'correct' ? 3 : mark === 'present' ? 2 : 1; }
function buildKeyState(attempts: Attempt[]) {
  const map = new Map<string, Mark>();
  for (const attempt of attempts) attempt.guess.toUpperCase().split('').forEach((letter, i) => {
    const mark = attempt.marks[i]; const prev = map.get(letter);
    if (!prev || keyRanks(mark) > keyRanks(prev)) map.set(letter, mark);
  });
  return map;
}

export function GameBoard({ state, language, busy, onGuess }: Props) {
  const copy = t(language), round = state.round!;
  const [current, setCurrent] = useState('');
  const [shake, setShake] = useState(false);
  const [flashRow, setFlashRow] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);
  const previousAttempts = useRef(state.myAttempts.length);
  const { play } = useFeedback();
  const me = state.players.find((p) => p.id === state.me.id)!;
  const keyState = useMemo(() => buildKeyState(state.myAttempts), [state.myAttempts]);

  useEffect(() => {
    if (state.myAttempts.length > previousAttempts.current) {
      setFlashRow(state.myAttempts.length - 1); play(me?.solved ? 'win' : 'accept');
      const timer = setTimeout(() => setFlashRow(null), 900); previousAttempts.current = state.myAttempts.length;
      return () => clearTimeout(timer);
    }
  }, [state.myAttempts.length, me?.solved, play]);

  useEffect(() => {
    const tick = () => setSeconds(round.finishDeadline ? Math.max(0, Math.ceil((Date.parse(round.finishDeadline) - Date.now()) / 1000)) : null);
    tick(); const id = setInterval(tick, 250); return () => clearInterval(id);
  }, [round.finishDeadline]);

  const submit = async () => {
    if (busy || me?.completed) return;
    if (current.length !== round.wordLength) { setShake(true); play('error'); setTimeout(() => setShake(false), 420); return; }
    const ok = await onGuess(current.toLowerCase());
    if (ok) setCurrent(''); else { setShake(true); play('error'); setTimeout(() => setShake(false), 420); }
  };

  const press = (raw: string) => {
    if (busy || me?.completed) return;
    const key = raw.toUpperCase();
    if (key === 'ENTER') { void submit(); return; }
    if (key === 'BACKSPACE' || key === '⌫') { setCurrent((v) => v.slice(0, -1)); play('tap'); return; }
    if (/^[A-ZÑ]$/.test(key) && current.length < round.wordLength && (language === 'es' || key !== 'Ñ')) { setCurrent((v) => v + key); play('tap'); }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Enter') press('ENTER'); else if (e.key === 'Backspace') press('BACKSPACE'); else if (/^[a-zA-ZñÑ]$/.test(e.key)) press(e.key);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  const rowCount = round.maxAttempts;
  const boardRows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const attempt = state.myAttempts.find((a) => a.rowIndex === rowIndex);
    const draft = rowIndex === state.myAttempts.length ? current : '';
    return <div className={`board-row ${shake && rowIndex === state.myAttempts.length ? 'shake' : ''} ${flashRow === rowIndex ? 'revealing' : ''}`} key={rowIndex}>
      {Array.from({ length: round.wordLength }, (_, col) => {
        const letter = attempt?.guess[col]?.toUpperCase() ?? draft[col] ?? '';
        const mark = attempt?.marks[col];
        return <div key={col} style={{ '--i': col } as React.CSSProperties} className={`tile ${mark ?? ''} ${letter && !mark ? 'filled' : ''}`}><span>{letter}</span>{mark && <i aria-hidden="true">{mark === 'correct' ? '●' : mark === 'present' ? '◆' : '×'}</i>}</div>;
      })}
    </div>;
  });

  return <main className="game-shell active-game">
    <header className="game-header"><div className="round-pill">#{round.roundNumber}</div><div className="arena-title">PALABRA <b>ARENA</b></div><div className="attempt-pill">{state.myAttempts.length}/{round.maxAttempts}</div></header>
    <section className="opponents-strip">
      {state.players.map((player) => <div className={`opponent ${player.id === state.me.id ? 'me' : ''} ${player.solved ? 'solved' : ''}`} key={player.id}>
        <span>{player.name.slice(0,1).toUpperCase()}</span><div><strong>{player.id === state.me.id ? copy.you : player.name}</strong><small>{player.solved ? '✓' : `${player.attemptsCount}/${round.maxAttempts}`}</small></div>
      </div>)}
    </section>
    {seconds !== null && <div className="finish-banner"><b>{copy.finishWindow}</b><span>{seconds}s</span></div>}
    <section className="board-wrap">{boardRows}{me?.solved && <div className="solved-stamp">{copy.solved}</div>}</section>
    <section className="keyboard" aria-label="keyboard">
      {rows.map((row, index) => <div className="key-row" key={row}>{index === 2 && <button className="key wide" onClick={() => press('ENTER')}>↵</button>}{row.split('').filter((k) => language === 'es' || k !== 'Ñ').map((key) => <button className={`key ${keyState.get(key) ?? ''}`} key={key} onClick={() => press(key)}>{key}</button>)}{index === 2 && <button className="key wide" onClick={() => press('⌫')}>⌫</button>}</div>)}
    </section>
  </main>;
}
