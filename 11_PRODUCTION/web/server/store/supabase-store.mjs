import { resolveRoundConfig } from '../domain/word-game.mjs';
import { normalizeWord } from '../data/words.mjs';
import { modeId, countryId } from '../data/modes.mjs';
import { hashToken, newId, newRoomCode, newToken, safePlayerName, safeRoomName, hashRoomPassword, verifyRoomPassword } from '../domain/security.mjs';

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
    let data;
    try { data = text ? JSON.parse(text) : null; }
    catch { throw apiError('DATABASE_INVALID_RESPONSE', 502); }
    if (!res.ok) {
      const errorCode = data?.message || data?.code || 'DATABASE_ERROR';
      const status = {
        ROOM_NOT_FOUND:404,UNAUTHORIZED_PLAYER:401,WRONG_LENGTH:422,
        INVALID_LETTERS:422,PLAYER_FINISHED:409,NO_ACTIVE_ROUND:409,
        COUNTDOWN_ACTIVE:409,ROUND_EXPIRED:409,ROUND_SECRET_MISSING:500,
        ROOM_FULL:409,ROOM_CODE_COLLISION:409,ROOM_CHANGED:409,HOST_ONLY:403,ROOM_NOT_EDITABLE:409,INVALID_ROOM_PASSWORD:403
      }[errorCode] ?? (data?.code === 'PGRST202' ? 503 : 502);
      throw apiError(data?.code === 'PGRST202' ? 'DB_MIGRATION_REQUIRED' : errorCode, status);
    }
    return data;
  }

  async checkSchema() {
    return this.rpc('pa_health_v1', {});
  }

  async rpc(name, args) {
    return this.request(`rpc/${name}`, { method: 'POST', body: args });
  }

  async one(path) {
    const rows = await this.request(path);
    return rows?.[0] ?? null;
  }

  roomDto(room, count = 0) {
    return {
      id: room.id, code: room.code, name:room.name, visibility: room.visibility, language: room.language,
      mode: room.mode || 'classic', country: room.country || 'random', languageMode:room.language_mode || 'fixed',
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
    const rooms = await this.request('rooms?visibility=in.(public,private)&status=in.(lobby,active,result)&select=*&order=created_at.desc&limit=80');
    if (!rooms?.length) return [];
    const ids = rooms.map(r => r.id).join(',');
    const players = await this.request(`room_players?room_id=in.(${ids})&select=room_id`);
    const counts = new Map();
    for(const p of players) counts.set(p.room_id,(counts.get(p.room_id)||0)+1);
    return rooms.map(r=>this.roomDto(r,counts.get(r.id)||0)).sort((a,b)=>Number(b.status==='lobby')-Number(a.status==='lobby')||b.createdAt.localeCompare(a.createdAt));
  }

  async createRoom({ visibility, language, lengthMode, playerName, mode, country, languageMode, roomName, password }) {
    const roomId=newId(),playerId=newId(),token=newToken();
    const normalizedLength=lengthMode==='random'?'random':Number(lengthMode);
    const selectedVisibility=visibility==='solo'?'solo':visibility==='private'?'private':'public';
    const selectedLanguage=language==='en'?'en':'es';
    const selectedMode=modeId(mode),selectedCountry=countryId(country);
    const selectedLanguageMode=languageMode==='random'?'random':'fixed';
    for(const lang of selectedLanguageMode==='random'?['es','en']:[selectedLanguage])
      resolveRoundConfig(lang,normalizedLength,selectedMode,selectedCountry,()=>0);
    const roomNameSafe=safeRoomName(roomName,playerName),hostName=safePlayerName(playerName);
    const passwordHash=selectedVisibility==='private'?hashRoomPassword(password):null;
    // Room and host are created together in PostgreSQL; no orphan room on partial failure.
    for(let tries=0;tries<5;tries++){
      const code=newRoomCode(),now=nowIso();
      try{
        await this.rpc('pa_create_room_v2',{
          p_room_id:roomId,p_code:code,p_name:roomNameSafe,p_visibility:selectedVisibility,
          p_password_hash:passwordHash,p_language:selectedLanguage,p_mode:selectedMode,
          p_country:selectedCountry,p_language_mode:selectedLanguageMode,p_length_mode:String(normalizedLength),
          p_host_player_id:playerId,p_host_name:hostName,p_token_hash:hashToken(token)
        });
        const room={id:roomId,code,name:roomNameSafe,visibility:selectedVisibility,language:selectedLanguage,
          mode:selectedMode,country:selectedCountry,language_mode:selectedLanguageMode,
          length_mode:String(normalizedLength),status:'lobby',host_player_id:playerId,created_at:now};
        return {room:this.roomDto(room,1),player:{id:playerId,token,name:hostName}};
      }catch(err){if(err.code!=='ROOM_CODE_COLLISION'||tries===4)throw err;}
    }
    throw apiError('ROOM_CODE_COLLISION',409);
  }

  async joinRoom({ code, playerName, password }) {
    const room = await this.one(`rooms?code=eq.${encodeURIComponent(String(code ?? '').trim().toUpperCase())}&status=neq.closed&select=*`);
    if (!room || room.visibility === 'solo') throw apiError('ROOM_NOT_FOUND', 404);
    if (room.status !== 'lobby') throw apiError('ROUND_ALREADY_STARTED', 409);
    if (room.visibility === 'private' && !verifyRoomPassword(password, room.password_hash)) throw apiError('INVALID_ROOM_PASSWORD', 403);
    const id=newId(), token=newToken(), name=safePlayerName(playerName);
    // DB row locking makes capacity checks and privacy transitions atomic.
    const joined = await this.rpc('pa_join_room_v2', {
      p_code: room.code, p_player_id:id, p_name:name, p_token_hash:hashToken(token),
      p_expected_visibility:room.visibility, p_expected_password_hash:room.password_hash
    });
    return { room: this.roomDto(room, joined.count), player: { id, token, name } };
  }

  async updateRoomPrivacy({ roomId, playerId, token, visibility, password }) {
    if (!['public','private'].includes(visibility)) throw apiError('INVALID_VISIBILITY',422);
    // Without a replacement password, the existing hash is retained only if already private.
    const { room } = await this.auth(roomId,playerId,token);
    const hash = visibility==='public' ? null : password ? hashRoomPassword(password) : room.password_hash;
    if (visibility==='private' && !hash) throw apiError('PASSWORD_LENGTH',422);
    await this.rpc('pa_change_privacy_v2', {
      p_room_id:roomId, p_player_id:playerId, p_token_hash:hashToken(token),
      p_visibility:visibility,p_password_hash:hash
    });
    return this.getRoomState({roomId,playerId,token});
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
    if (room.mode === 'duel' && players.length !== 2) throw apiError('NEED_TWO_PLAYERS',409);
    if (room.visibility !== 'solo' && players.some((p) => p.id !== player.id && !p.ready)) throw apiError('PLAYERS_NOT_READY', 409);
    const prev = await this.currentRound(roomId);
    const roundLanguage=room.language_mode==='random'?(Math.random()<.5?'es':'en'):room.language;
    const config = resolveRoundConfig(roundLanguage,room.length_mode,room.mode,room.country);
    const wordLength = config.wordLength;
    const roundId = newId();
    const started = new Date(Date.now()+3000).toISOString();
    await this.request('rounds', { method: 'POST', body: {
      id: roundId, room_id: roomId, round_number: (prev?.round_number ?? 0) + 1,
      language: roundLanguage, word_length: wordLength, max_attempts: room.mode === 'duel' ? 5 : MAX_ATTEMPTS,
      selected_country:config.selectedCountry, hint:config.hint, deadline_at:room.mode === 'blitz' ? new Date(Date.now()+93000).toISOString() : null,
      status: 'active', started_at: started, first_solved_at: null, finish_deadline: null,
      ended_at: null, winner_player_id: null
    }});
    await this.request('round_secrets', { method: 'POST', body: { round_id: roundId, target_word: config.targetWord } });
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
    if (allCompleted || graceExpired || (round.deadline_at && Date.now() >= Date.parse(round.deadline_at))) {
      const ended = nowIso();
      await this.request(`rounds?id=eq.${round.id}`, { method: 'PATCH', body: { status: 'result', ended_at: ended } });
      await this.request(`rooms?id=eq.${roomId}`, { method: 'PATCH', body: { status: 'result', updated_at: ended } });
    }
  }

  async submitGuess({ roomId, playerId, token, guess, requestId }) {
    // A single PostgreSQL transaction evaluates/records the guess. Never use a
    // read-modify-write HTTP sequence here: simultaneous requests could consume
    // the same turn, corrupt the attempt counter or pick multiple winners.
    await this.rpc('pa_submit_guess_v1', {
      p_room_id: roomId, p_player_id: playerId,
      p_token_hash: hashToken(token), p_guess: normalizeWord(guess),
      p_request_id: requestId && /^[0-9a-f-]{36}$/i.test(requestId) ? requestId : newId()
    });
    return this.getRoomState({ roomId, playerId, token });
  }

  async getRoomState({ roomId, playerId, token }) {
    // One authenticated PostgREST RPC instead of 4-6 REST requests per poll.
    // The SQL function can reveal a secret ONLY if round.status='result'.
    return this.rpc('pa_get_room_state_v2', {
      p_room_id: roomId, p_player_id: playerId,
      p_token_hash: hashToken(token)
    });
  }

  async forfeit(args) {
    const {player}=await this.auth(args.roomId,args.playerId,args.token);
    await this.request(`room_players?id=eq.${player.id}`,{method:'PATCH',body:{completed:true}});
    await this.maybeFinalize(args.roomId);
    return this.getRoomState(args);
  }
  async leaveRoom(args) {
    const {room,player}=await this.auth(args.roomId,args.playerId,args.token);
    await this.request(`room_players?id=eq.${player.id}`,{method:'DELETE'});
    const remaining=await this.playerRows(room.id);
    if(!remaining.length) await this.request(`rooms?id=eq.${room.id}`,{method:'PATCH',body:{status:'closed',updated_at:nowIso()}});
    else if(room.host_player_id===player.id) await this.request(`rooms?id=eq.${room.id}`,{method:'PATCH',body:{host_player_id:remaining[0].id,updated_at:nowIso()}});
    await this.maybeFinalize(room.id);
    return {ok:true};
  }
  async finishRound(args) {
    const {room,player}=await this.auth(args.roomId,args.playerId,args.token);
    if(room.host_player_id!==player.id)throw apiError('HOST_ONLY',403);
    const round=await this.currentRound(room.id);
    if(!round||round.status!=='active')throw apiError('NO_ACTIVE_ROUND',409);
    const stamp=nowIso();
    await Promise.all([
      this.request(`rounds?id=eq.${round.id}`,{method:'PATCH',body:{status:'result',ended_at:stamp}}),
      this.request(`rooms?id=eq.${room.id}`,{method:'PATCH',body:{status:'result',updated_at:stamp}})
    ]);
    return this.getRoomState(args);
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
