-- PALABRA ARENA 0.2.2 - apply AFTER schema.sql, 0.2.0_modes.sql,
-- 0.2.1_atomic_state.sql. Additive, does not reveal passwords in browser RPCs.
-- Check your existing permissions/service role before production rollout.
alter table public.rooms add column if not exists name text not null default 'Sala sin nombre';
alter table public.rooms add column if not exists password_hash text null;
create index if not exists idx_rooms_discovery
  on public.rooms (status, visibility, created_at desc)
  where visibility <> 'solo' and status <> 'closed';

-- Atomic create keeps host and room together, never leaving a ghost on a failed write.
create or replace function public.pa_create_room_v2(
  p_room_id uuid,p_code text,p_name text,p_visibility text,p_password_hash text,
  p_language text,p_mode text,p_country text,p_language_mode text,p_length_mode text,
  p_host_player_id uuid,p_host_name text,p_token_hash text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.rooms where code=p_code) then
    raise exception 'ROOM_CODE_COLLISION' using errcode='P0001';
  end if;
  if p_visibility not in ('solo','public','private')
    or (p_visibility='private' and (p_password_hash is null or p_password_hash not like 'scrypt$%'))
    or (p_visibility<>'private' and p_password_hash is not null) then
    raise exception 'INVALID_VISIBILITY' using errcode='P0001';
  end if;
  insert into public.rooms(id,code,name,visibility,password_hash,language,mode,country,language_mode,
    length_mode,status,host_player_id,created_at,updated_at)
  values(p_room_id,p_code,left(p_name,40),p_visibility,p_password_hash,p_language,p_mode,p_country,
    p_language_mode,p_length_mode,'lobby',p_host_player_id,clock_timestamp(),clock_timestamp());
  insert into public.room_players(id,room_id,name,ready,session_token_hash,joined_at,attempts_count,solved,completed)
  values(p_host_player_id,p_room_id,left(p_host_name,18),true,p_token_hash,clock_timestamp(),0,false,false);
  return jsonb_build_object('ok',true);
exception when unique_violation then
  raise exception 'ROOM_CODE_COLLISION' using errcode='P0001';
end;
$$;

-- Wrapper keeps 0.2.1 state contract and adds the room's display name only.
-- Never select password_hash or return arbitrary DB rows to the client.
create or replace function public.pa_get_room_state_v2(
  p_room_id uuid, p_player_id uuid, p_token_hash text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_state jsonb; v_name text;
begin
  v_state := public.pa_get_room_state_v1(p_room_id,p_player_id,p_token_hash);
  select name into v_name from public.rooms where id=p_room_id;
  return jsonb_set(v_state,'{room,name}',to_jsonb(coalesce(v_name,'Sala sin nombre')),true);
end;
$$;

-- Atomic join: locks the room before verifying privacy version and capacity.
-- Node checks scrypt password; SQL checks that the validated hash STILL matches
-- after any simultaneous host privacy change.
create or replace function public.pa_join_room_v2(
  p_code text,p_player_id uuid,p_name text,p_token_hash text,
  p_expected_visibility text,p_expected_password_hash text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_room public.rooms%rowtype; v_count integer;
begin
  select * into v_room from public.rooms where code=p_code for update;
  if not found or v_room.visibility='solo' or v_room.status='closed' then
    raise exception 'ROOM_NOT_FOUND' using errcode='P0001';
  end if;
  if v_room.status<>'lobby' then
    raise exception 'ROUND_ALREADY_STARTED' using errcode='P0001';
  end if;
  if v_room.visibility is distinct from p_expected_visibility
    or v_room.password_hash is distinct from p_expected_password_hash then
    raise exception 'ROOM_CHANGED' using errcode='P0001';
  end if;
  if v_room.visibility='private' and v_room.password_hash is null then
    raise exception 'INVALID_ROOM_PASSWORD' using errcode='P0001';
  end if;
  select count(*) into v_count from public.room_players where room_id=v_room.id;
  if v_count >= case when v_room.mode='duel' then 2 else 8 end then
    raise exception 'ROOM_FULL' using errcode='P0001';
  end if;
  insert into public.room_players
    (id,room_id,name,ready,session_token_hash,joined_at,attempts_count,solved,completed)
  values(p_player_id,v_room.id,left(p_name,18),false,p_token_hash,clock_timestamp(),0,false,false);
  update public.rooms set updated_at=clock_timestamp() where id=v_room.id;
  return jsonb_build_object('count',v_count+1);
end;
$$;

-- Host-only privacy mutation; never resets players, game status or the room ID.
create or replace function public.pa_change_privacy_v2(
  p_room_id uuid,p_player_id uuid,p_token_hash text,
  p_visibility text,p_password_hash text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_room public.rooms%rowtype; v_player public.room_players%rowtype;
begin
  select * into v_room from public.rooms where id=p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode='P0001'; end if;
  select * into v_player from public.room_players where id=p_player_id
    and room_id=p_room_id and session_token_hash=p_token_hash;
  if not found then raise exception 'UNAUTHORIZED_PLAYER' using errcode='P0001'; end if;
  if v_room.host_player_id<>p_player_id then
    raise exception 'HOST_ONLY' using errcode='P0001';
  end if;
  if v_room.visibility='solo' or v_room.status='closed' then
    raise exception 'ROOM_NOT_EDITABLE' using errcode='P0001';
  end if;
  if p_visibility not in ('public','private') or
    (p_visibility='private' and (p_password_hash is null or p_password_hash not like 'scrypt$%')) then
    raise exception 'INVALID_VISIBILITY' using errcode='P0001';
  end if;
  update public.rooms set visibility=p_visibility,
    password_hash=case when p_visibility='public' then null else p_password_hash end,
    updated_at=clock_timestamp() where id=p_room_id;
  return jsonb_build_object('ok',true);
end;
$$;

revoke all on function public.pa_create_room_v2(uuid,text,text,text,text,text,text,text,text,text,uuid,text,text) from public,anon,authenticated;
revoke all on function public.pa_get_room_state_v2(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.pa_join_room_v2(text,uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.pa_change_privacy_v2(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.pa_create_room_v2(uuid,text,text,text,text,text,text,text,text,text,uuid,text,text) to service_role;
grant execute on function public.pa_get_room_state_v2(uuid,uuid,text) to service_role;
grant execute on function public.pa_join_room_v2(text,uuid,text,text,text,text) to service_role;
grant execute on function public.pa_change_privacy_v2(uuid,uuid,text,text,text) to service_role;

create or replace function public.pa_health_v1() returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object('schema','0.2.2','databaseTime',clock_timestamp());
$$;
revoke all on function public.pa_health_v1() from public,anon,authenticated;
grant execute on function public.pa_health_v1() to service_role;
