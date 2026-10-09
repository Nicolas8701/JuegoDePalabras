-- Apply AFTER schema.sql on an existing Supabase project (non-destructive migration).
alter table public.rooms add column if not exists language_mode text not null default 'fixed';
alter table public.rooms add column if not exists mode text not null default 'classic';
alter table public.rooms add column if not exists country text not null default 'random';
alter table public.rounds add column if not exists selected_country text not null default 'random';
alter table public.rounds add column if not exists hint text not null default '';
alter table public.rounds add column if not exists deadline_at timestamptz null;
create index if not exists idx_rooms_mode_language on public.rooms(mode,language,country) where status='lobby';
