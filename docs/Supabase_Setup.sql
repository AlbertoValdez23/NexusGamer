-- NexusGamer: persistencia directa para la demo pública.
-- Ejecutar una sola vez en Supabase Dashboard → SQL Editor → New query → Run.

create table if not exists public.shop_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.shop_states enable row level security;

drop policy if exists "shop_states_select_own" on public.shop_states;
create policy "shop_states_select_own"
on public.shop_states for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "shop_states_insert_own" on public.shop_states;
create policy "shop_states_insert_own"
on public.shop_states for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "shop_states_update_own" on public.shop_states;
create policy "shop_states_update_own"
on public.shop_states for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.shop_states from anon;
grant select, insert, update on table public.shop_states to authenticated;
