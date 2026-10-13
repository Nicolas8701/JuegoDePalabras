import { resolveRoundConfig, evaluateGuess, resolveWordLength, validateGuess } from '../domain/word-game.mjs';
import { modeId, countryId } from '../data/modes.mjs';
import { hashToken, newId, newRoomCode, newToken, safePlayerName, safeRoomName, hashRoomPassword, verifyRoomPassword } from '../domain/security.mjs';

const FINISH_GRACE_MS = 15_000;
const MAX_ATTEMPTS = 6;

function nowIso() {
  return new Date().toISOString();
}

function publicRoom(room, playerCount = 0) {
  return {
    id: room.id,
    code: room.code,
    name: room.name,
    visibility: room.visibility,
    language: room.language,
    mode: room.mode || 'classic', country: room.country || 'random', languageMode:room.languageMode || 'fixed',
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
      .filter((r) => r.visibility !== 'solo' && r.status !== 'closed')
      .map((r) => publicRoom(r, this.playersInRoom(r.id).length))
      .sort((a, b) => Number(b.status === 'lobby') - Number(a.status === 'lobby') || b.createdAt.localeCompare(a.createdAt));
  }

  async createRoom({ visibility, language, lengthMode, playerName, mode, country, languageMode, roomName, password }) {
    const roomId = newId();
    const playerId = newId();
    const token = newToken();
    let code;
    do code = newRoomCode(); while ([...this.rooms.values()].some((r) => r.code === code));

    const room = {
      id: roomId,
      code,
      name: safeRoomName(roomName, playerName),
      passwordHash: visibility === 'private' ? hashRoomPassword(password) : null,
      visibility: visibility === 'private' ? 'private' : visibility === 'solo' ? 'solo' : 'public',
      language: language === 'en' ? 'en' : 'es',
      mode: modeId(mode), country: countryId(country), languageMode:languageMode==='random'?'random':'fixed',
      lengthMode: lengthMode === 'random' ? 'random' : Number(lengthMode),
      status: 'lobby',
      hostPlayerId: playerId,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    for(const lang of (room.languageMode==='random'?['es','en']:[room.language])) resolveRoundConfig(lang,room.lengthMode,room.mode,room.country,()=>0);
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

  async joinRoom({ code, playerName, password }) {
    const normalizedCode = String(code ?? '').trim().toUpperCase();
    const room = [...this.rooms.values()].find((r) => r.code === normalizedCode && r.status !== 'closed');
    if (!room) throw this.error('ROOM_NOT_FOUND', 404);
    if (room.status !== 'lobby') throw this.error('ROUND_ALREADY_STARTED', 409);
    if (room.visibility === 'solo') throw this.error('ROOM_NOT_FOUND', 404);
    if (room.visibility === 'private' && !verifyRoomPassword(password, room.passwordHash)) throw this.error('INVALID_ROOM_PASSWORD', 403);
    if (this.playersInRoom(room.id).length >= (room.mode === 'duel' ? 2 : 8)) throw this.error('ROOM_FULL', 409);

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

  async updateRoomPrivacy({ roomId, playerId, token, visibility, password }) {
    const { room, player } = this.auth(roomId, playerId, token);
    if (room.hostPlayerId !== player.id) throw this.error('HOST_ONLY', 403);
    if (room.visibility === 'solo' || room.status === 'closed') throw this.error('ROOM_NOT_EDITABLE', 409);
    if (!['public', 'private'].includes(visibility)) throw this.error('INVALID_VISIBILITY', 422);
    const nextHash = visibility === 'private'
      ? (password ? hashRoomPassword(password) : room.passwordHash)
      : null;
    if (visibility === 'private' && !nextHash) throw this.error('PASSWORD_LENGTH', 422);
    room.visibility = visibility;
    room.passwordHash = nextHash;
    room.updatedAt = nowIso();
    return this.getRoomState({ roomId, playerId, token });
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
    if (room.mode === 'duel' && players.length !== 2) throw this.error('NEED_TWO_PLAYERS',409);
    if (room.visibility !== 'solo' && players.some((p) => p.id !== player.id && !p.ready)) {
      throw this.error('PLAYERS_NOT_READY', 409);
    }
    const prev = this.currentRound(roomId);
    const roundLanguage=room.languageMode==='random'?(Math.random()<.5?'es':'en'):room.language;
    const config = resolveRoundConfig(roundLanguage, room.lengthMode, room.mode, room.country);
    const wordLength = config.wordLength;
    const round = {
      id: newId(),
      roomId,
      roundNumber: (prev?.roundNumber ?? 0) + 1,
      language: roundLanguage,
      wordLength,
      targetWord: config.targetWord,
      selectedCountry: config.selectedCountry, hint: config.hint,
      mode: room.mode, deadlineAt: room.mode === 'blitz' ? new Date(Date.now()+93000).toISOString() : null,
      status: 'active',
      maxAttempts: room.mode === 'duel' ? 5 : MAX_ATTEMPTS,
      startedAt: new Date(Date.now()+3000).toISOString(),
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
    const timedOut = round.deadlineAt && Date.now() >= Date.parse(round.deadlineAt);
    if (allCompleted || graceExpired || timedOut) {
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
    if (Date.now() < Date.parse(round.startedAt)) throw this.error('COUNTDOWN_ACTIVE',409);
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
      deadlineAt: round.deadlineAt, selectedCountry: round.selectedCountry, hint: round.hint,
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

  async forfeit(args) {
    const {player} = this.auth(args.roomId,args.playerId,args.token);
    player.completed=true;
    this.maybeFinalize(args.roomId);
    return this.getRoomState(args);
  }
  async leaveRoom(args) {
    const {room,player} = this.auth(args.roomId,args.playerId,args.token);
    this.players.delete(player.id);
    const rest=this.playersInRoom(room.id);
    if(!rest.length) room.status='closed';
    else if(room.hostPlayerId===player.id) room.hostPlayerId=rest[0].id;
    this.maybeFinalize(room.id);
    return {ok:true};
  }
  async finishRound(args) {
    const {room,player}=this.auth(args.roomId,args.playerId,args.token);
    if(room.hostPlayerId!==player.id) throw this.error('HOST_ONLY',403);
    const round=this.currentRound(room.id);
    if(!round||round.status!=='active') throw this.error('NO_ACTIVE_ROUND',409);
    round.status='result'; round.endedAt=nowIso();room.status='result';room.updatedAt=nowIso();
    return this.getRoomState(args);
  }
  error(code, status = 400) {
    const err = new Error(code);
    err.code = code;
    err.status = status;
    return err;
  }
}
