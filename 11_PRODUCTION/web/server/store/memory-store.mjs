import { chooseTarget, evaluateGuess, resolveWordLength, validateGuess } from '../domain/word-game.mjs';
import { hashToken, newId, newRoomCode, newToken, safePlayerName } from '../domain/security.mjs';

const FINISH_GRACE_MS = 15_000;
const MAX_ATTEMPTS = 6;

function nowIso() {
  return new Date().toISOString();
}

function publicRoom(room, playerCount = 0) {
  return {
    id: room.id,
    code: room.code,
    visibility: room.visibility,
    language: room.language,
    lengthMode: room.lengthMode,
    status: room.status,
    hostPlayerId: room.hostPlayerId,
    playerCount,
    createdAt: room.createdAt
  };
}

export class MemoryStore {
  constructor() {
    this.rooms = new Map();
    this.players = new Map();
    this.rounds = new Map();
    this.attempts = [];
  }

  playersInRoom(roomId) {
    return [...this.players.values()].filter((p) => p.roomId === roomId);
  }

  currentRound(roomId) {
    const rounds = [...this.rounds.values()].filter((r) => r.roomId === roomId);
    return rounds.sort((a, b) => b.roundNumber - a.roundNumber)[0] ?? null;
  }

  async listPublicRooms() {
    return [...this.rooms.values()]
      .filter((r) => r.visibility === 'public' && r.status === 'lobby')
      .map((r) => publicRoom(r, this.playersInRoom(r.id).length))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createRoom({ visibility, language, lengthMode, playerName }) {
    const roomId = newId();
    const playerId = newId();
    const token = newToken();
    let code;
    do code = newRoomCode(); while ([...this.rooms.values()].some((r) => r.code === code));

    const room = {
      id: roomId,
      code,
      visibility: visibility === 'private' ? 'private' : visibility === 'solo' ? 'solo' : 'public',
      language: language === 'en' ? 'en' : 'es',
      lengthMode: lengthMode === 'random' ? 'random' : Number(lengthMode),
      status: 'lobby',
      hostPlayerId: playerId,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    resolveWordLength(room.lengthMode, () => 0);
    const player = {
      id: playerId,
      roomId,
      name: safePlayerName(playerName),
      ready: true,
      tokenHash: hashToken(token),
      joinedAt: nowIso(),
      attemptsCount: 0,
      solved: false,
      completed: false,
      solvedAt: null
    };
    this.rooms.set(roomId, room);
    this.players.set(playerId, player);
    return { room: publicRoom(room, 1), player: { id: playerId, token, name: player.name } };
  }

  async joinRoom({ code, playerName }) {
    const normalizedCode = String(code ?? '').trim().toUpperCase();
    const room = [...this.rooms.values()].find((r) => r.code === normalizedCode && r.status !== 'closed');
    if (!room) throw this.error('ROOM_NOT_FOUND', 404);
    if (room.status !== 'lobby') throw this.error('ROUND_ALREADY_STARTED', 409);
    if (this.playersInRoom(room.id).length >= 8) throw this.error('ROOM_FULL', 409);

    const id = newId();
    const token = newToken();
    const player = {
      id,
      roomId: room.id,
      name: safePlayerName(playerName),
      ready: false,
      tokenHash: hashToken(token),
      joinedAt: nowIso(),
      attemptsCount: 0,
      solved: false,
      completed: false,
      solvedAt: null
    };
    this.players.set(id, player);
    room.updatedAt = nowIso();
    return { room: publicRoom(room, this.playersInRoom(room.id).length), player: { id, token, name: player.name } };
  }

  auth(roomId, playerId, token) {
    const room = this.rooms.get(roomId);
    const player = this.players.get(playerId);
    if (!room) throw this.error('ROOM_NOT_FOUND', 404);
    if (!player || player.roomId !== roomId || player.tokenHash !== hashToken(token)) {
      throw this.error('UNAUTHORIZED_PLAYER', 401);
    }
    return { room, player };
  }

  async setReady({ roomId, playerId, token, ready }) {
    const { player } = this.auth(roomId, playerId, token);
    player.ready = Boolean(ready);
    return this.getRoomState({ roomId, playerId, token });
  }

  async startRound({ roomId, playerId, token }) {
    const { room, player } = this.auth(roomId, playerId, token);
    if (room.hostPlayerId !== player.id) throw this.error('HOST_ONLY', 403);
    if (room.status === 'active') throw this.error('ROUND_ALREADY_ACTIVE', 409);

    const players = this.playersInRoom(roomId);
    if (room.visibility !== 'solo' && players.some((p) => p.id !== player.id && !p.ready)) {
      throw this.error('PLAYERS_NOT_READY', 409);
    }
    const prev = this.currentRound(roomId);
    const wordLength = resolveWordLength(room.lengthMode);
    const round = {
      id: newId(),
      roomId,
      roundNumber: (prev?.roundNumber ?? 0) + 1,
      language: room.language,
      wordLength,
      targetWord: chooseTarget(room.language, wordLength),
      status: 'active',
      maxAttempts: MAX_ATTEMPTS,
      startedAt: nowIso(),
      firstSolvedAt: null,
      finishDeadline: null,
      endedAt: null,
      winnerPlayerId: null
    };
    this.rounds.set(round.id, round);
    room.status = 'active';
    room.updatedAt = nowIso();
    for (const p of players) {
      p.ready = false;
      p.attemptsCount = 0;
      p.solved = false;
      p.completed = false;
      p.solvedAt = null;
    }
    return this.getRoomState({ roomId, playerId, token });
  }

  maybeFinalize(roomId) {
    const room = this.rooms.get(roomId);
    const round = this.currentRound(roomId);
    if (!room || !round || round.status !== 'active') return;
    const players = this.playersInRoom(roomId);
    const allCompleted = players.length > 0 && players.every((p) => p.completed);
    const graceExpired = round.finishDeadline && Date.now() >= Date.parse(round.finishDeadline);
    if (allCompleted || graceExpired) {
      round.status = 'result';
      round.endedAt = nowIso();
      room.status = 'result';
      room.updatedAt = nowIso();
    }
  }

  async submitGuess({ roomId, playerId, token, guess }) {
    const { room, player } = this.auth(roomId, playerId, token);
    this.maybeFinalize(roomId);
    const round = this.currentRound(roomId);
    if (!round || round.status !== 'active' || room.status !== 'active') throw this.error('NO_ACTIVE_ROUND', 409);
    if (player.completed) throw this.error('PLAYER_FINISHED', 409);

    const validation = validateGuess(round.language, round.wordLength, guess);
    if (!validation.ok) throw this.error(validation.code, 422);
    if (player.attemptsCount >= round.maxAttempts) throw this.error('NO_ATTEMPTS_LEFT', 409);

    const marks = evaluateGuess(round.targetWord, validation.guess);
    const solved = marks.every((m) => m === 'correct');
    player.attemptsCount += 1;
    player.solved = solved;
    if (solved) {
      player.completed = true;
      player.solvedAt = nowIso();
      if (!round.firstSolvedAt) {
        round.firstSolvedAt = player.solvedAt;
        round.winnerPlayerId = player.id;
        round.finishDeadline = new Date(Date.now() + FINISH_GRACE_MS).toISOString();
      }
    } else if (player.attemptsCount >= round.maxAttempts) {
      player.completed = true;
    }

    this.attempts.push({
      id: newId(),
      roundId: round.id,
      playerId: player.id,
      rowIndex: player.attemptsCount - 1,
      guess: validation.guess,
      marks,
      acceptedAt: nowIso()
    });
    this.maybeFinalize(roomId);
    return this.getRoomState({ roomId, playerId, token });
  }

  async getRoomState({ roomId, playerId, token }) {
    const { room, player } = this.auth(roomId, playerId, token);
    this.maybeFinalize(roomId);
    const round = this.currentRound(roomId);
    const players = this.playersInRoom(roomId).map((p) => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
      attemptsCount: p.attemptsCount,
      solved: p.solved,
      completed: p.completed,
      solvedAt: p.solvedAt,
      isHost: p.id === room.hostPlayerId
    }));
    const myAttempts = round
      ? this.attempts.filter((a) => a.roundId === round.id && a.playerId === player.id).map(({ guess, marks, rowIndex }) => ({ guess, marks, rowIndex }))
      : [];
    const safeRound = round ? {
      id: round.id,
      roundNumber: round.roundNumber,
      language: round.language,
      wordLength: round.wordLength,
      maxAttempts: round.maxAttempts,
      status: round.status,
      startedAt: round.startedAt,
      finishDeadline: round.finishDeadline,
      winnerPlayerId: round.winnerPlayerId,
      answer: round.status === 'result' ? round.targetWord : undefined
    } : null;
    return { room: publicRoom(room, players.length), me: { id: player.id, name: player.name }, players, round: safeRound, myAttempts };
  }

  async rematch(args) {
    const { room, player } = this.auth(args.roomId, args.playerId, args.token);
    if (room.hostPlayerId !== player.id) throw this.error('HOST_ONLY', 403);
    if (room.status !== 'result') throw this.error('ROUND_NOT_FINISHED', 409);
    for (const p of this.playersInRoom(room.id)) p.ready = p.id === player.id;
    room.status = 'lobby';
    room.updatedAt = nowIso();
    return this.getRoomState(args);
  }

  error(code, status = 400) {
    const err = new Error(code);
    err.code = code;
    err.status = status;
    return err;
  }
}
