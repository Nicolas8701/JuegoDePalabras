-- PALABRA ARENA 0.2.1 CANDIDATE: read-state and guess as server-only RPCs.
-- Run AFTER schema.sql and 0.2.0_modes.sql. Safe to rerun (CREATE OR REPLACE).
-- Preserve rooms/rounds/attempts; this migration never clears existing user data.
-- Idempotency key prevents duplicate client submissions from consuming an extra attempt.
alter table public.attempts add column if not exists client_request_id uuid null;
create unique index if not exists idx_attempt_client_request
  on public.attempts(round_id,player_id,client_request_id)
  where client_request_id is not null;

create or replace function public.pa_get_room_state_v1(
  p_room_id uuid, p_player_id uuid, p_token_hash text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_room public.rooms%rowtype;
  v_player public.room_players%rowtype;
  v_round public.rounds%rowtype;
  v_players jsonb;
  v_attempts jsonb;
  v_answer text;
  v_count integer;
  v_completed boolean;
  v_finished boolean;
  v_now timestamptz := clock_timestamp();
  v_round_json jsonb;
begin
  select * into v_room from public.rooms where id=p_room_id;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0001'; end if;
  select * into v_player from public.room_players
    where id=p_player_id and room_id=p_room_id and session_token_hash=p_token_hash;
  if not found then raise exception 'UNAUTHORIZED_PLAYER' using errcode='P0001'; end if;

  select * into v_round from public.rounds
    where room_id=p_room_id order by round_number desc limit 1;
  select count(*), coalesce(bool_and(completed),false) into v_count,v_completed
    from public.room_players where room_id=p_room_id;
  if v_round.id is not null and v_round.status='active' then
    v_finished := (v_count>0 and v_completed)
       or (v_round.finish_deadline is not null and v_now>=v_round.finish_deadline)
       or (v_round.deadline_at is not null and v_now>=v_round.deadline_at);
    if v_finished then
      update public.rounds set status='result',ended_at=coalesce(ended_at,v_now)
        where id=v_round.id and status='active';
      update public.rooms set status='result',updated_at=v_now
        where id=p_room_id and status='active';
      -- Read actual committed row (another request may have finished concurrently).
      select * into v_round from public.rounds where id=v_round.id;
      select * into v_room from public.rooms where id=p_room_id;
    end if;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'ready',p.ready,'attemptsCount',p.attempts_count,
    'solved',p.solved,'completed',p.completed,'solvedAt',p.solved_at,
    'isHost',p.id=v_room.host_player_id
  ) order by p.joined_at), '[]'::jsonb) into v_players
    from public.room_players p where p.room_id=p_room_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'guess',a.guess,'marks',a.marks,'rowIndex',a.row_index
  ) order by a.row_index), '[]'::jsonb) into v_attempts
    from public.attempts a where a.player_id=p_player_id and a.round_id=v_round.id;
  if v_round.id is not null then
    v_round_json := jsonb_build_object(
      'id',v_round.id,'roundNumber',v_round.round_number,'language',v_round.language,
      'wordLength',v_round.word_length,'maxAttempts',v_round.max_attempts,
      'status',v_round.status,'startedAt',v_round.started_at,
      'finishDeadline',v_round.finish_deadline,'deadlineAt',v_round.deadline_at,
      'selectedCountry',v_round.selected_country,'hint',v_round.hint,
      'winnerPlayerId',v_round.winner_player_id
    );
    if v_round.status='result' then
      select target_word into v_answer from public.round_secrets where round_id=v_round.id;
      v_round_json := v_round_json || jsonb_build_object('answer',v_answer);
    end if;
  end if;
  return jsonb_build_object(
    'room',jsonb_build_object(
      'id',v_room.id,'code',v_room.code,'visibility',v_room.visibility,
      'language',v_room.language,'mode',v_room.mode,'country',v_room.country,
      'languageMode',v_room.language_mode,'lengthMode',v_room.length_mode,
      'status',v_room.status,'hostPlayerId',v_room.host_player_id,
      'playerCount',v_count,'createdAt',v_room.created_at
    ),
    'me',jsonb_build_object('id',v_player.id,'name',v_player.name),
    'players',v_players,'round',v_round_json,'myAttempts',v_attempts
  );
end;
$$;

create or replace function public.pa_submit_guess_v1(
  p_room_id uuid, p_player_id uuid, p_token_hash text, p_guess text, p_request_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_room public.rooms%rowtype;
  v_player public.room_players%rowtype;
  v_round public.rounds%rowtype;
  v_target text;
  v_result text[];
  v_taken boolean[];
  v_i integer;
  v_j integer;
  v_solved boolean;
  v_count integer;
  v_at timestamptz := clock_timestamp();
begin
  -- Consistent locking: room -> round -> player; serializes two concurrent submits.
  select * into v_room from public.rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0001'; end if;
  select * into v_player from public.room_players
    where id=p_player_id and room_id=p_room_id and session_token_hash=p_token_hash for update;
  if not found then raise exception 'UNAUTHORIZED_PLAYER' using errcode='P0001'; end if;
  select * into v_round from public.rounds
    where room_id=p_room_id order by round_number desc limit 1 for update;
  if v_round.id is not null and exists (
    select 1 from public.attempts
    where round_id=v_round.id and player_id=p_player_id and client_request_id=p_request_id
  ) then
    return jsonb_build_object('accepted',true,'duplicate',true);
  end if;
  v_at := clock_timestamp();
  if v_round.id is null or v_round.status<>'active' or v_room.status<>'active'
    then raise exception 'NO_ACTIVE_ROUND' using errcode='P0001'; end if;
  if v_at < v_round.started_at then raise exception 'COUNTDOWN_ACTIVE' using errcode='P0001'; end if;
  if (v_round.finish_deadline is not null and v_at >= v_round.finish_deadline)
    or (v_round.deadline_at is not null and v_at >= v_round.deadline_at)
    then raise exception 'ROUND_EXPIRED' using errcode='P0001'; end if;
  if v_player.completed or v_player.attempts_count>=v_round.max_attempts
    then raise exception 'PLAYER_FINISHED' using errcode='P0001'; end if;
  if p_guess is null or char_length(p_guess)<>v_round.word_length
    then raise exception 'WRONG_LENGTH' using errcode='P0001'; end if;
  if p_guess !~ '^[a-zñ]+$' or (v_round.language='en' and position('ñ' in p_guess)>0)
    then raise exception 'INVALID_LETTERS' using errcode='P0001'; end if;
  select target_word into v_target from public.round_secrets where round_id=v_round.id;
  if v_target is null then raise exception 'ROUND_SECRET_MISSING' using errcode='P0001'; end if;
  v_result := array_fill('absent'::text,array[v_round.word_length]);
  v_taken := array_fill(false,array[v_round.word_length]);
  -- Pass 1: exact positions, consume their matching target letters.
  for v_i in 1..v_round.word_length loop
    if substr(p_guess,v_i,1)=substr(v_target,v_i,1) then
      v_result[v_i]:='correct';v_taken[v_i]:=true;
    end if;
  end loop;
  -- Pass 2: remaining target-letter occurrences, each consumed at most once.
  for v_i in 1..v_round.word_length loop
    if v_result[v_i]='absent' then
      for v_j in 1..v_round.word_length loop
        if not v_taken[v_j] and substr(p_guess,v_i,1)=substr(v_target,v_j,1) then
          v_result[v_i]:='present';v_taken[v_j]:=true;exit;
        end if;
      end loop;
    end if;
  end loop;
  v_solved := array_position(v_result,'absent') is null and array_position(v_result,'present') is null;
  v_count := v_player.attempts_count+1;
  insert into public.attempts(id,round_id,player_id,row_index,guess,marks,accepted_at,client_request_id)
    values(gen_random_uuid(),v_round.id,p_player_id,v_count-1,p_guess,v_result,v_at,p_request_id);
  update public.room_players set attempts_count=v_count,solved=v_solved,
    completed=(v_solved or v_count>=v_round.max_attempts),
    solved_at=case when v_solved then v_at else solved_at end
    where id=p_player_id;
  if v_solved and v_round.first_solved_at is null then
    update public.rounds set first_solved_at=v_at,winner_player_id=p_player_id,
      finish_deadline=v_at+interval '15 seconds' where id=v_round.id;
  end if;
  if not exists (select 1 from public.room_players where room_id=p_room_id and not completed) then
    update public.rounds set status='result',ended_at=v_at where id=v_round.id and status='active';
    update public.rooms set status='result',updated_at=v_at where id=p_room_id and status='active';
  end if;
  return jsonb_build_object('accepted',true,'rowIndex',v_count-1,'solved',v_solved);
end;
$$;

-- No direct browser access. Only Netlify Functions with the service role can invoke.
revoke all on function public.pa_get_room_state_v1(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.pa_submit_guess_v1(uuid,uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.pa_get_room_state_v1(uuid,uuid,text) to service_role;
grant execute on function public.pa_submit_guess_v1(uuid,uuid,text,text,uuid) to service_role;

create or replace function public.pa_health_v1() returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object('schema','0.2.1','databaseTime',clock_timestamp());
$$;
revoke all on function public.pa_health_v1() from public, anon, authenticated;
grant execute on function public.pa_health_v1() to service_role;
