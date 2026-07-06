create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null,
  location text not null,
  capacity_mw numeric(10,2) not null,
  bess_mwh numeric(10,2) not null,
  performance_ratio numeric(5,4) not null,
  status text not null check (status in ('draft', 'review', 'active')),
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.yield_series (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  month text not null,
  sort_order integer not null,
  yield_mwh numeric(12,2) not null,
  irradiance numeric(8,2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.capex_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null,
  amount_usd numeric(12,2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  title text not null,
  detail text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  title text not null,
  content text not null,
  synced boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.projects enable row level security;
alter table public.yield_series enable row level security;
alter table public.capex_items enable row level security;
alter table public.recommendations enable row level security;
alter table public.drafts enable row level security;

create policy "project owners manage projects"
on public.projects
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "project owners manage drafts"
on public.drafts
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "project owners read yield series"
on public.yield_series
for select
using (
  exists (
    select 1
    from public.projects
    where projects.id = yield_series.project_id
      and projects.owner_id = auth.uid()
  )
);

create policy "project owners read capex items"
on public.capex_items
for select
using (
  exists (
    select 1
    from public.projects
    where projects.id = capex_items.project_id
      and projects.owner_id = auth.uid()
  )
);

create policy "project owners read recommendations"
on public.recommendations
for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.projects
    where projects.id = recommendations.project_id
      and projects.owner_id = auth.uid()
  )
);
