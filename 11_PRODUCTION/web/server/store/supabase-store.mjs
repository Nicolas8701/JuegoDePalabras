import { chooseTarget, evaluateGuess, resolveWordLength, validateGuess } from '../domain/word-game.mjs';
import { hashToken, newId, newRoomCode, newToken, safePlayerName } from '../domain/security.mjs';

const MAX_ATTEMPTS = 6;
const FINISH_GRACE_MS = 15_000;

function nowIso() { return new Date().toISOString(); }
function apiError(code, status = 400) { const e = new Error(code); e.code = code; e.status = status; return e; }

export class SupabaseStore {
  constructor(url, serviceKey) {
    this.base = `${url.replace(/\/$/, '')}/rest/v1`;
    this.headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    };
  }

  async request(path, { method = 'GET', body, prefer } = {}) {
    const headers = { ...this.headers };
    if (prefer) headers.Prefer = prefer;
    const res = await fetch(`${this.base}/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw apiError(data?.message || data?.code || 'DATABASE_ERROR', 500);
    return data;
  }

  async one(path) {
    const rows = await this.request(path);
    return rows?.[0] ?? null;
  }

  roomDto(room, count = 0) {
    return {
      id: room.id, code: room.code, visibility: room.visibility, language: room.language,
      lengthMode: room.length_mode, status: room.status, hostPlayerId: room.host_player_id,
      playerCount: count, createdAt: room.created_at
    };
  }

  async playerRows(roomId) {
    return this.request(`room_players?room_id=eq.${encodeURIComponent(roomId)}&select=*`);
  }

  async getRoom(roomId) {
    return this.one(`rooms?id=eq.${encodeURIComponent(roomId)}&select=*`);
  }

  async getPlayer(playerId) {
    return this.one(`room_players?id=eq.${encodeURIComponent(playerId)}&select=*`);
  }

  async currentRound(roomId) {
    return this.one(`rounds?room_id=eq.${encodeURIComponent(roomId)}&select=*&order=round_number.desc&limit=1`);
  }

  async auth(roomId, playerId, token) {
    const [room, player] = await Promise.all([this.getRoom(roomId), this.getPlayer(playerId)]);
    if (!room) throw apiError('ROOM_NOT_FOUND', 404);
    if (!player || player.room_id !== roomId || player.session_token_hash !== hashToken(token)) throw apiError('UNAUTHORIZED_PLAYER', 401);
    return { room, player };
  }

  async listPublicRooms() {
    const rooms = await this.request('rooms?visibility=eq.public&status=eq.lobby&select=*&order=created_at.desc&limit=40');
    const result = [];
    for (const room of rooms ?? []) result.push(this.roomDto(room, (await this.playerRows(room.id)).length));
    return result;
  }

  async createRoom({ visibility, language, lengthMode, playerName }) {
    const roomId = newId(), playerId = newId(), token = newToken();
    const normalizedLength = lengthMode === 'random' ? 'random' : Number(lengthMode);
    resolveWordLength(normalizedLength, () => 0);
    let code = newRoomCode();
    for (let tries = 0; tries < 5; tries += 1) {
      const collision = await this.one(`rooms?code=eq.${code}&select=id`);
      if (!collision) break;
      code = newRoomCode();
    }
    const room = {
      id: roomId, code, visibility: visibility === 'private' ? 'private' : visibility === 'solo' ? 'solo' : 'public',
      language: language === 'en' ? 'en' : 'es', length_mode: String(normalizedLength), status: 'lobby',
      host_player_id: playerId, created_at: nowIso(), updated_at: nowIso()
    };
    const player = {
      id: playerId, room_id: roomId, name: safePlayerName(playerName), ready: true,
      session_token_hash: hashToken(token), joined_at: nowIso(), attempts_count: 0,
      solved: false, completed: false, solved_at: null
    };
    await this.request('rooms', { method: 'POST', body: room, prefer: 'return=representation' });
    await this.request('room_players', { method: 'POST', body: player, prefer: 'return=representation' });
    return { room: this.roomDto(room, 1), player: { id: playerId, token, name: player.name } };
  }

  async joinRoom({ code, playerName }) {
    const room = await this.one(`rooms?code=eq.${encodeURIComponent(String(code ?? '').trim().toUpperCase())}&status=neq.closed&select=*`);
    if (!room) throw apiError('ROOM_NOT_FOUND', 404);
    if (room.status !== 'lobby') throw apiError('ROUND_ALREADY_STARTED', 409);
    const players = await this.playerRows(room.id);
    if (players.length >= 8) throw apiError('ROOM_FULL', 409);
    const id = newId(), token = newToken();
    const player = {
      id, room_id: room.id, name: safePlayerName(playerName), ready: false,
      session_token_hash: hashToken(token), joined_at: nowIso(), attempts_count: 0,
      solved: false, completed: false, solved_at: null
    };
    await this.request('room_players', { method: 'POST', body: player, prefer: 'return=representation' });
    return { room: this.roomDto(room, players.length + 1), player: { id, token, name: player.name } };
  }

  async setReady({ roomId, playerId, token, ready }) {
    await this.auth(roomId, playerId, token);
    await this.request(`room_players?id=eq.${playerId}`, { method: 'PATCH', body: { ready: Boolean(ready) } });
    return this.getRoomState({ roomId, playerId, token });
  }

  async startRound({ roomId, playerId, token }) {
    const { room, player } = await this.auth(roomId, playerId, token);
    if (room.host_player_id !== player.id) throw apiError('HOST_ONLY', 403);
    if (room.status === 'active') throw apiError('ROUND_ALREADY_ACTIVE', 409);
    const players = await this.playerRows(roomId);
    if (room.visibility !== 'solo' && players.some((p) => p.id !== player.id && !p.ready)) throw apiError('PLAYERS_NOT_READY', 409);
    const prev = await this.currentRound(roomId);
    const wordLength = resolveWordLength(room.length_mode);
    const roundId = newId();
    const started = nowIso();
    await this.request('rounds', { method: 'POST', body: {
      id: roundId, room_id: roomId, round_number: (prev?.round_number ?? 0) + 1,
      language: room.language, word_length: wordLength, max_attempts: MAX_ATTEMPTS,
      status: 'active', started_at: started, first_solved_at: null, finish_deadline: null,
      ended_at: null, winner_player_id: null
    }});
    await this.request('round_secrets', { method: 'POST', body: { round_id: roundId, target_word: chooseTarget(room.language, wordLength) } });
    await this.request(`rooms?id=eq.${roomId}`, { method: 'PATCH', body: { status: 'active', updated_at: started } });
    await this.request(`room_players?room_id=eq.${roomId}`, { method: 'PATCH', body: { ready: false, attempts_count: 0, solved: false, completed: false, solved_at: null } });
    return this.getRoomState({ roomId, playerId, token });
  }

  async maybeFinalize(roomId) {
    const round = await this.currentRound(roomId);
    if (!round || round.status !== 'active') return;
    const players = await this.playerRows(roomId);
    const allCompleted = players.length > 0 && players.every((p) => p.completed);
    const graceExpired = round.finish_deadline && Date.now() >= Date.parse(round.finish_deadline);
    if (allCompleted || graceExpired) {
      const ended = nowIso();
      await this.request(`rounds?id=eq.${round.id}`, { method: 'PATCH', body: { status: 'result', ended_at: ended } });
      await this.request(`rooms?id=eq.${roomId}`, { method: 'PATCH', body: { status: 'result', updated_at: ended } });
    }
  }

  async submitGuess({ roomId, playerId, token, guess }) {
    const { room, player } = await this.auth(roomId, playerId, token);
    await this.maybeFinalize(roomId);
    const round = await this.currentRound(roomId);
    if (!round || round.status !== 'active' || room.status === 'result') throw apiError('NO_ACTIVE_ROUND', 409);
    if (player.completed) throw apiError('PLAYER_FINISHED', 409);
    const validation = validateGuess(round.language, round.word_length, guess);
    if (!validation.ok) throw apiError(validation.code, 422);
    const secret = await this.one(`round_secrets?round_id=eq.${round.id}&select=target_word`);
    if (!secret) throw apiError('ROUND_SECRET_MISSING', 500);
    const marks = evaluateGuess(secret.target_word, validation.guess);
    const solved = marks.every((m) => m === 'correct');
    const attemptCount = Number(player.attempts_count ?? 0) + 1;
    const completed = solved || attemptCount >= round.max_attempts;
    const solvedAt = solved ? nowIso() : null;
    await this.request('attempts', { method: 'POST', body: {
      id: newId(), round_id: round.id, player_id: player.id, row_index: attemptCount - 1,
      guess: validation.guess, marks, accepted_at: nowIso()
    }});
    await this.request(`room_players?id=eq.${player.id}`, { method: 'PATCH', body: {
      attempts_count: attemptCount, solved, completed, solved_at: solvedAt
    }});
    if (solved && !round.first_solved_at) {
      await this.request(`rounds?id=eq.${round.id}&first_solved_at=is.null`, { method: 'PATCH', body: {
        first_solved_at: solvedAt, winner_player_id: player.id,
        finish_deadline: new Date(Date.now() + FINISH_GRACE_MS).toISOString()
      }});
    }
    await this.maybeFinalize(roomId);
    return this.getRoomState({ roomId, playerId, token });
  }

  async getRoomState({ roomId, playerId, token }) {
    const { room, player } = await this.auth(roomId, playerId, token);
    await this.maybeFinalize(roomId);
    const [freshRoom, players, round] = await Promise.all([this.getRoom(roomId), this.playerRows(roomId), this.currentRound(roomId)]);
    let myAttempts = [], answer;
    if (round) {
      myAttempts = await this.request(`attempts?round_id=eq.${round.id}&player_id=eq.${player.id}&select=guess,marks,row_index&order=row_index.asc`);
      if (round.status === 'result') answer = (await this.one(`round_secrets?round_id=eq.${round.id}&select=target_word`))?.target_word;
    }
    return {
      room: this.roomDto(freshRoom, players.length), me: { id: player.id, name: player.name },
      players: players.map((p) => ({ id: p.id, name: p.name, ready: p.ready, attemptsCount: p.attempts_count,
        solved: p.solved, completed: p.completed, solvedAt: p.solved_at, isHost: p.id === freshRoom.host_player_id })),
      round: round ? { id: round.id, roundNumber: round.round_number, language: round.language, wordLength: round.word_length,
        maxAttempts: round.max_attempts, status: round.status, startedAt: round.started_at, finishDeadline: round.finish_deadline,
        winnerPlayerId: round.winner_player_id, answer } : null,
      myAttempts: myAttempts.map((a) => ({ guess: a.guess, marks: a.marks, rowIndex: a.row_index }))
    };
  }

  async rematch(args) {
    const { room, player } = await this.auth(args.roomId, args.playerId, args.token);
    if (room.host_player_id !== player.id) throw apiError('HOST_ONLY', 403);
    if (room.status !== 'result') throw apiError('ROUND_NOT_FINISHED', 409);
    await this.request(`rooms?id=eq.${room.id}`, { method: 'PATCH', body: { status: 'lobby', updated_at: nowIso() } });
    await this.request(`room_players?room_id=eq.${room.id}`, { method: 'PATCH', body: { ready: false } });
    await this.request(`room_players?id=eq.${player.id}`, { method: 'PATCH', body: { ready: true } });
    return this.getRoomState(args);
  }
}
