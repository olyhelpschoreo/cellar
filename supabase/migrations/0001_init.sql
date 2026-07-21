-- Cellar — initial schema (Plants vertical)
-- NOTE: not yet applied. This is the target Postgres schema for when we wire
-- Supabase Auth + Storage. Every row is owned by a user; RLS enforces that a
-- user only ever sees their own collection. Mirrors src/lib/types.ts.

-- ---------------------------------------------------------------------------
-- plants
-- ---------------------------------------------------------------------------
create table if not exists public.plants (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  nickname       text not null,
  species        text not null default '',
  scientific_name text,
  photo_url      text,
  location       text,
  light          text not null default 'medium'
                   check (light in ('low', 'medium', 'bright')),
  water_every_days integer not null default 7 check (water_every_days > 0),
  acquired_date  date,
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists plants_user_id_idx on public.plants (user_id);

-- ---------------------------------------------------------------------------
-- care_events
-- ---------------------------------------------------------------------------
create table if not exists public.care_events (
  id         uuid primary key default gen_random_uuid(),
  plant_id   uuid not null references public.plants (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null
               check (type in ('watered','fertilized','repotted','pruned','photo','noted')),
  date       date not null default current_date,
  note       text,
  photo_url  text,
  created_at timestamptz not null default now()
);

create index if not exists care_events_plant_id_idx on public.care_events (plant_id);
create index if not exists care_events_user_id_idx on public.care_events (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.plants enable row level security;
alter table public.care_events enable row level security;

create policy "own plants — select" on public.plants
  for select using (auth.uid() = user_id);
create policy "own plants — insert" on public.plants
  for insert with check (auth.uid() = user_id);
create policy "own plants — update" on public.plants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own plants — delete" on public.plants
  for delete using (auth.uid() = user_id);

create policy "own care_events — select" on public.care_events
  for select using (auth.uid() = user_id);
create policy "own care_events — insert" on public.care_events
  for insert with check (auth.uid() = user_id);
create policy "own care_events — update" on public.care_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own care_events — delete" on public.care_events
  for delete using (auth.uid() = user_id);
