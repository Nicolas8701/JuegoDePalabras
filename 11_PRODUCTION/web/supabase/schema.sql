-- PALABRA_ARENA 0.1.0-dev
-- Server-only persistence. The browser never reads these tables directly in this slice.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key,
  code text not null unique,
  visibility text not null check (visibility in ('public','private','solo')),
  language text not null check (language in ('es','en')),
  length_mode text not null,
  status text not null check (status in ('lobby','active','result','closed')),
  host_player_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_players (
  id uuid primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  ready boolean not null default false,
  session_token_hash text not null,
  joined_at timestamptz not null default now(),
  attempts_count integer not null default 0,
  solved boolean not null default false,
  completed boolean not null default false,
  solved_at timestamptz null
);

create table if not exists public.rounds (
  id uuid primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  round_number integer not null,
  language text not null check (language in ('es','en')),
  word_length integer not null check (word_length between 4 and 8),
  max_attempts integer not null default 6,
  status text not null check (status in ('active','result')),
  started_at timestamptz not null default now(),
  first_solved_at timestamptz null,
  finish_deadline timestamptz null,
  ended_at timestamptz null,
  winner_player_id uuid null
);

create table if not exists public.round_secrets (
  round_id uuid primary key references public.rounds(id) on delete cascade,
  target_word text not null
);

create table if not exists public.attempts (
  id uuid primary key,
  round_id uuid not null references public.rounds(id) on delete cascade,
  player_id uuid not null references public.room_players(id) on delete cascade,
  row_index integer not null,
  guess text not null,
  marks text[] not null,
  accepted_at timestamptz not null default now(),
  unique(round_id, player_id, row_index)
);

create index if not exists idx_room_players_room on public.room_players(room_id);
create index if not exists idx_rounds_room_number on public.rounds(room_id, round_number desc);
create index if not exists idx_attempts_round_player on public.attempts(round_id, player_id, row_index);
create index if not exists idx_rooms_public on public.rooms(visibility, status, created_at desc);

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.rounds enable row level security;
alter table public.round_secrets enable row level security;
alter table public.attempts enable row level security;

-- Intentionally no anon/authenticated policies in 0.1.0-dev.
-- All access goes through Netlify Functions using SUPABASE_SERVICE_ROLE_KEY.
-- This prevents the target word from being exposed through direct client queries.
