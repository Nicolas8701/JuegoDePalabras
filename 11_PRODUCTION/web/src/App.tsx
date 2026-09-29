import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoom, getState, joinRoom, listRooms, rematch, setReady, startRound, submitGuess, ApiError } from './api/client';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { Result } from './components/Result';
import { t } from './game/i18n';
import type { Language, LengthMode, RoomState, RoomSummary, Session, Visibility } from './types/api';

const SESSION_KEY = 'palabra:session';
const NAME_KEY = 'palabra:name';
const LANG_KEY = 'palabra:language';

function loadSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function App() {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'es');
  const [playerName, setPlayerNameState] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [session, setSession] = useState<Session | null>(loadSession);
  const [state, setState] = useState<RoomState | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useMemo(() => t(language), [language]);
  const persistSession = (next: Session | null) => {
    setSession(next);
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next)); else localStorage.removeItem(SESSION_KEY);
  };
  const setLanguage = (value: Language) => { setLanguageState(value); localStorage.setItem(LANG_KEY, value); };
  const setPlayerName = (value: string) => { setPlayerNameState(value); localStorage.setItem(NAME_KEY, value); };

  const translateError = useCallback((err: unknown) => {
    const code = err instanceof ApiError ? err.code : 'UNKNOWN';
    const map: Record<string, string> = {
      NOT_IN_DICTIONARY: copy.notInDictionary, WRONG_LENGTH: copy.wrongLength, PLAYERS_NOT_READY: copy.playersNotReady,
      ROOM_NOT_FOUND: copy.roomNotFound, ROOM_FULL: copy.roomFull, UNAUTHORIZED_PLAYER: copy.roomNotFound
    };
    return map[code] ?? copy.genericError;
  }, [copy]);

  const refreshState = useCallback(async (silent = false) => {
    if (!session) return;
    try {
      const next = await getState(session); setState(next); setLanguage(next.room.language); if (!silent) setError(null);
    } catch (err) {
      if (!silent) setError(translateError(err));
      if (err instanceof ApiError && [401,404].includes(err.status)) { persistSession(null); setState(null); }
    }
  }, [session, translateError]);

  useEffect(() => { if (session) void refreshState(); }, [session, refreshState]);
  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => void refreshState(true), state?.room.status === 'active' ? 700 : 1200);
    return () => clearInterval(id);
  }, [session, refreshState, state?.room.status]);

  const action = async (fn: () => Promise<RoomState | void>, options?: { keepError?: boolean }) => {
    setBusy(true); if (!options?.keepError) setError(null);
    try { const result = await fn(); if (result) setState(result); return true; }
    catch (err) { setError(translateError(err)); return false; }
    finally { setBusy(false); }
  };

  const onCreate = async (visibility: Visibility, lengthMode: LengthMode) => {
    await action(async () => {
      const nextSession = await createRoom({ visibility, language, lengthMode, playerName });
      setPlayerName(nextSession.playerName); persistSession(nextSession);
      const initial = await getState(nextSession);
      if (visibility === 'solo') return startRound(nextSession);
      return initial;
    });
  };

  const onJoin = async (code: string) => {
    await action(async () => {
      const nextSession = await joinRoom(code, playerName); setPlayerName(nextSession.playerName); persistSession(nextSession); return getState(nextSession);
    });
  };

  const refreshRooms = useCallback(async () => {
    try { setRooms(await listRooms()); } catch { setError(copy.genericError); }
  }, [copy.genericError]);

  const leave = () => { persistSession(null); setState(null); setError(null); };

  return <div className="app-root">
    <div className="ambient a1"/><div className="ambient a2"/>
    {error && <div className="toast" role="alert"><span>!</span>{error}<button onClick={() => setError(null)}>×</button></div>}
    {!session && <Home language={language} onLanguage={setLanguage} playerName={playerName} onPlayerName={setPlayerName} busy={busy} rooms={rooms} onRefreshRooms={refreshRooms} onCreate={onCreate} onJoin={onJoin} />}
    {session && !state && <div className="loading-screen"><div className="loader"/><p>PALABRA ARENA</p></div>}
    {session && state?.room.status === 'lobby' && <Lobby state={state} language={language} busy={busy} onReady={(ready) => void action(() => setReady(session, ready))} onStart={() => void action(() => startRound(session))} onLeave={leave} />}
    {session && state?.room.status === 'active' && state.round && <GameBoard state={state} language={language} busy={busy} onGuess={(guess) => action(() => submitGuess(session, guess))} />}
    {session && state?.room.status === 'result' && state.round && <Result state={state} language={language} busy={busy} onRematch={() => void action(() => rematch(session))} onLeave={leave} />}
  </div>;
}
