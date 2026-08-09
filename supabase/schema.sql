-- ============================================================
-- RYVO — Esquema de base de datos (Supabase / Postgres)
-- Actualizado para reflejar todo lo que hemos construido: premios y
-- cashback por gimnasio, racha semanal, grupo muscular, comodín de
-- "olvidé fichar", aviso GPS. (El monitor y el bonus de clase dirigida
-- se han quitado del alcance de momento.)
--
-- Cómo usarlo: pega TODO este archivo en el SQL Editor de tu proyecto
-- de Supabase y dale a "Run". Crea todas las tablas de una vez.
-- ============================================================

-- ---------- Gimnasios ----------
-- La configuración propia de cada gimnasio (cashback, racha) vive aquí
-- mismo como columnas, en vez de en tablas aparte — es una sola fila
-- de ajustes por gimnasio, no una lista, así que no hace falta unir
-- tablas para leerla.
create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,              -- usado en la URL de fichaje: /checkin?gym=slug
  nfc_token text unique not null,         -- token secreto grabado en la placa NFC/QR
  min_sessions_per_week int not null default 2,       -- para mantener la racha semanal
  cashback_enabled boolean not null default true,
  cashback_min_days_per_month int not null default 12,
  cashback_discount_euros numeric(6,2) not null default 5,
  created_at timestamptz not null default now()
);

-- ---------- Socios ----------
create table members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  full_name text not null,
  phone text,
  member_code text not null,
  device_id text,                          -- identifica el móvil del socio (sustituye al localStorage actual)

  xp_total int not null default 0,
  total_sesiones_validas int not null default 0,
  ultima_sesion timestamptz,

  -- Racha semanal (ver lib/memberStore.ts → computeWeeklyUpdate)
  current_week_index int,
  current_week_sessions int not null default 0,
  racha_semanas int not null default 0,

  -- Cashback: días distintos entrenados en el mes en curso
  cashback_month_key text,                 -- "YYYY-MM"
  session_days_this_month text[] not null default '{}',

  last_comodin_claim timestamptz,          -- último uso del comodín "olvidé fichar"
  anomalias_gps int not null default 0,    -- fichajes marcados lejos del gym (solo aviso)

  created_at timestamptz not null default now(),
  unique (gym_id, member_code)
);

create index idx_members_gym on members(gym_id);
create index idx_members_device on members(device_id);

-- ---------- Fichajes ----------
-- Cada fichaje: se crea al hacer Tap 1 (entrada) y se completa al
-- hacer Tap 2 (salida). Es la fuente de verdad — el Radar de Riesgo se
-- calcula a partir de esto, no de contadores guardados a mano (a
-- diferencia de la versión actual en localStorage, que sí usa
-- contadores manuales porque no tiene una tabla real detrás).
create table checkins (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int,
  is_valid boolean,                        -- true si duration_minutes >= 45
  xp_awarded int default 0,
  muscle_group text,                       -- selector opcional al fichar salida
  flagged_anomaly boolean default false,   -- aviso GPS, ver checkin/page.tsx
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
  announcement text,                       -- texto libre opcional que escribe el CEO
  created_at timestamptz not null default now()
);

create index idx_rewards_gym on rewards(gym_id, xp_required);

-- ---------- Vista: actividad reciente por socio ----------
-- Esta es la mejora real de tener una tabla de verdad: los últimos
-- 14/28 días se calculan al vuelo sobre fechas reales, no con un
-- contador que se puede desincronizar con el tiempo (que es justo la
-- limitación que tiene ahora mismo la versión en localStorage).
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
-- Activado ya, pero sin políticas todavía — de momento el backend usa
-- la service_role key (se salta RLS), que es lo normal mientras no
-- haya autenticación real de verdad conectada (fase siguiente: migrar
-- el login de demo actual a Supabase Auth).
alter table gyms enable row level security;
alter table members enable row level security;
alter table checkins enable row level security;
alter table rewards enable row level security;
