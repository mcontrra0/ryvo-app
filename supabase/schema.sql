-- ============================================================
-- PODIUM — Esquema inicial de base de datos (Supabase / Postgres)
-- MVP: Fichaje NFC/QR + Radar de Riesgo de Baja
-- ============================================================

-- Un gimnasio cliente de Podium
create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,           -- usado en la URL de fichaje: /checkin?gym=slug
  nfc_token text unique not null,      -- token secreto grabado en la placa NFC/QR
  created_at timestamptz not null default now()
);

-- Un socio de un gimnasio
create table members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  full_name text not null,
  phone text,
  member_code text not null,           -- código corto que el socio usa para identificarse al fichar
  created_at timestamptz not null default now(),
  unique (gym_id, member_code)
);

-- Cada fichaje: se crea al hacer Tap 1 (entrada) y se completa al hacer Tap 2 (salida)
create table checkins (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int,                -- calculado al cerrar; debe ser >= 45 para ser válido
  is_valid boolean,                    -- true si duration_minutes >= 45
  xp_awarded int default 0,
  flagged_anomaly boolean default false, -- ej. duración sospechosamente exacta, revisar
  created_at timestamptz not null default now()
);

create index idx_checkins_member on checkins(member_id, started_at desc);
create index idx_checkins_gym on checkins(gym_id, started_at desc);

-- Vista de apoyo: última actividad y racha simple por socio (base del Radar de Riesgo)
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

-- Row Level Security (activar antes de ir a producción real)
alter table gyms enable row level security;
alter table members enable row level security;
alter table checkins enable row level security;

-- Nota: las políticas RLS reales (quién puede leer/escribir qué) se definen
-- cuando conectemos autenticación de verdad (fase siguiente). De momento,
-- en desarrollo, se puede trabajar con la service_role key desde el backend.
