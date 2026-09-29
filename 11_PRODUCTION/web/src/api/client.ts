import type { Language, LengthMode, RoomState, RoomSummary, Session, Visibility } from '../types/api';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options?.headers ?? {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? 'UNKNOWN_ERROR', res.status);
  return data as T;
}

function authBody(session: Session, extra: Record<string, unknown> = {}) {
  return JSON.stringify({ playerId: session.playerId, token: session.token, ...extra });
}

export async function listRooms(): Promise<RoomSummary[]> {
  return (await request<{ rooms: RoomSummary[] }>('/api/rooms')).rooms;
}

export async function createRoom(input: {
  visibility: Visibility;
  language: Language;
  lengthMode: LengthMode;
  playerName: string;
}): Promise<Session> {
  const data = await request<{ room: RoomSummary; player: { id: string; token: string; name: string } }>('/api/rooms', {
    method: 'POST', body: JSON.stringify(input)
  });
  return { roomId: data.room.id, playerId: data.player.id, token: data.player.token, playerName: data.player.name };
}

export async function joinRoom(code: string, playerName: string): Promise<Session> {
  const data = await request<{ room: RoomSummary; player: { id: string; token: string; name: string } }>('/api/rooms/join', {
    method: 'POST', body: JSON.stringify({ code, playerName })
  });
  return { roomId: data.room.id, playerId: data.player.id, token: data.player.token, playerName: data.player.name };
}

export function getState(session: Session): Promise<RoomState> {
  const q = new URLSearchParams({ playerId: session.playerId, token: session.token });
  return request(`/api/rooms/${session.roomId}/state?${q}`);
}

export function setReady(session: Session, ready: boolean): Promise<RoomState> {
  return request(`/api/rooms/${session.roomId}/ready`, { method: 'POST', body: authBody(session, { ready }) });
}

export function startRound(session: Session): Promise<RoomState> {
  return request(`/api/rooms/${session.roomId}/start`, { method: 'POST', body: authBody(session) });
}

export function submitGuess(session: Session, guess: string): Promise<RoomState> {
  return request(`/api/rooms/${session.roomId}/guess`, { method: 'POST', body: authBody(session, { guess }) });
}

export function rematch(session: Session): Promise<RoomState> {
  return request(`/api/rooms/${session.roomId}/rematch`, { method: 'POST', body: authBody(session) });
}
