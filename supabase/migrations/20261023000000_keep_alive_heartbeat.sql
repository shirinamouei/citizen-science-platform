-- Heartbeat used by .github/workflows/keep-alive.yml to keep the free-tier
-- project from being paused for inactivity. A read-only COUNT(*) through
-- PostgREST did not prevent a pause, so the ping now performs a real write.

create table if not exists keep_alive (
  id int primary key default 1 check (id = 1),  -- single-row table
  last_ping timestamptz not null default now()
);

-- RLS on with no policies: anon/authenticated can neither read nor write the
-- table directly. The only way in is the function below.
alter table keep_alive enable row level security;

create or replace function keep_alive_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  insert into keep_alive (id, last_ping) values (1, now())
  on conflict (id) do update set last_ping = excluded.last_ping
  returning last_ping;
$$;

revoke all on function keep_alive_ping() from public;
grant execute on function keep_alive_ping() to anon;
