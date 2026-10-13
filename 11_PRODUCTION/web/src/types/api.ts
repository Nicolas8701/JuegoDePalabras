export type Language = 'es' | 'en';
export type GameMode = 'classic' | 'culture' | 'insults' | 'blitz' | 'duel';
export type Country = 'random' | 'ar' | 'es' | 'us' | 'mx' | 'gb' | 'cl';
export type LengthMode = 4 | 5 | 6 | 7 | 8 | 'random';
export type Visibility = 'public' | 'private' | 'solo';
export type Mark = 'correct' | 'present' | 'absent';

export interface RoomSummary {
  id: string;
  code: string;
  name: string;
  visibility: Visibility;
  language: Language;
  mode: GameMode;
  country: Country;
  languageMode: 'fixed' | 'random';
  lengthMode: LengthMode | string | number;
  status: 'lobby' | 'active' | 'result' | 'closed';
  hostPlayerId: string;
  playerCount: number;
  createdAt: string;
}

export interface PlayerState {
  id: string;
  name: string;
  ready: boolean;
  attemptsCount: number;
  solved: boolean;
  completed: boolean;
  solvedAt: string | null;
  isHost: boolean;
}

export interface Attempt {
  guess: string;
  marks: Mark[];
  rowIndex: number;
}

export interface RoundState {
  id: string;
  roundNumber: number;
  language: Language;
  wordLength: number;
  maxAttempts: number;
  status: 'active' | 'result';
  startedAt: string;
  finishDeadline: string | null;
  deadlineAt: string | null;
  selectedCountry: Country;
  hint: string;
  winnerPlayerId: string | null;
  answer?: string;
}

export interface RoomState {
  room: RoomSummary;
  me: { id: string; name: string };
  players: PlayerState[];
  round: RoundState | null;
  myAttempts: Attempt[];
}

export interface Session {
  roomId: string;
  playerId: string;
  token: string;
  playerName: string;
}
