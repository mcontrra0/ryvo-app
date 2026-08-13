-- ============================================================
-- RYVO — Esquema de base de datos (Supabase / Postgres)
-- Versión consolidada — incluye el esquema original + las 4
-- migraciones que hemos ido aplicando por separado en el proyecto de
-- producción. Si es un proyecto NUEVO (ej. staging), este único
-- archivo ya deja todo listo de una vez.
--
-- Cómo usarlo: pega TODO este archivo en el SQL Editor de tu proyecto
-- de Supabase y dale a "Run".
-- ============================================================

-- ---------- Gimnasios ----------
create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,              -- usado en la URL de fichaje: /checkin?gym=slug
  nfc_token text unique not null,         -- token secreto grabado en la placa NFC/QR
  min_sessions_per_week int not null default 2,       -- para mantener la racha semanal
  cashback_enabled boolean not null default true,
  cashback_min_days_per_month int not null default 12,
  cashback_discount_euros numeric(6,2) not null default 5,
  rewards_customized boolean not null default false,  -- distingue "nunca tocado" de "vaciado a propósito"
  created_at timestamptz not null default now()
);

-- ---------- Socios ----------
create table members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  full_name text not null,
  phone text,
  pin text,                                -- PIN de 4 dígitos para acceder desde otro dispositivo
  member_code text not null,
  device_id text,

  xp_total int not null default 0,
  total_sesiones_validas int not null default 0,
  ultima_sesion timestamptz,

  current_week_index int,
  current_week_sessions int not null default 0,
  racha_semanas int not null default 0,

  cashback_month_key text,
  session_days_this_month text[] not null default '{}',

  last_comodin_claim timestamptz,
  anomalias_gps int not null default 0,

  created_at timestamptz not null default now(),
  unique (gym_id, member_code)
);

create index idx_members_gym on members(gym_id);
create index idx_members_device on members(device_id);

-- ---------- Fichajes ----------
create table checkins (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int,
  is_valid boolean,
  xp_awarded int default 0,
  muscle_group text,
  flagged_anomaly boolean default false,
  abandoned boolean not null default false,  -- sesión olvidada, pendiente de reclamar
  claimed boolean not null default false,    -- ya reclamada con el comodín
  created_at timestamptz not null default now()
);

create index idx_checkins_member on checkins(member_id, started_at desc);
create index idx_checkins_gym on checkins(gym_id, started_at desc);

-- ---------- Premios ----------
create table rewards (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  title text not null,
  xp_required int not null,
  announcement text,
  created_at timestamptz not null default now()
);

create index idx_rewards_gym on rewards(gym_id, xp_required);

-- ---------- Vista: actividad reciente por socio ----------
create or replace view member_activity as
select
  m.id as member_id,
  m.gym_id,
  m.full_name,
  count(c.id) filter (where c.is_valid) as total_sesiones_validas,
  max(c.started_at) as ultima_sesion,
  count(c.id) filter (where c.is_valid and c.started_at > now() - interval '14 days') as sesiones_ultimos_14_dias,
  count(c.id) filter (where c.is_valid and c.started_at between now() - interval '28 days' and now() - interval '14 days') as sesiones_14_28_dias_atras
from members m
left join checkins c on c.member_id = m.id
group by m.id, m.gym_id, m.full_name;

-- ---------- Row Level Security ----------
-- Desactivado por ahora — no hay Supabase Auth real conectado todavía
-- (seguimos con el login de demo en lib/auth.ts), así que no hay
-- políticas con sentido que escribir. Con RLS activado y sin políticas,
-- Postgres bloquea TODO acceso por defecto, incluida la clave anon que
-- usa la app.
--
-- ⚠️ TODO fase autenticación real: activarlo con políticas de verdad
-- antes de un piloto con socios reales.
alter table gyms disable row level security;
alter table members disable row level security;
alter table checkins disable row level security;
alter table rewards disable row level security;

-- ---------- Semilla del gimnasio piloto ----------
insert into gyms (name, slug, nfc_token)
values ('Box Rinconada', 'box-rinconada', 'pilot-token-cambiar-en-produccion')
on conflict (slug) do nothing;
