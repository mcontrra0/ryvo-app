"use client";

import { supabase } from "./supabase";
import { getGymBySlug } from "./gymStore";

// ============================================================
// Analítica real del gimnasio, calculada a partir de los fichajes de
// verdad en Supabase — nada de datos de ejemplo. Se trae una ventana
// de 180 días de una sola vez y se agrega en el propio navegador (por
// día, por hora, por mes) porque para un solo gimnasio en esta fase
// el volumen es pequeño — el día que haga falta, esto se puede mover
// a una vista SQL agregada sin cambiar la forma de los datos que
// devuelve esta función.
// ============================================================

export interface DailyCount {
  date: string; // YYYY-MM-DD
  label: string; // "Lun 12"
  count: number;
}

export interface HourlyCount {
  hour: number; // 0-23
  count: number;
}

export interface MonthlyCount {
  month: string; // "Mar"
  sesionesValidas: number;
  sociosActivos: number;
}

export interface GymAnalytics {
  sessionsByDay: DailyCount[]; // últimos 14 días
  peakHours: HourlyCount[]; // 0-23h
  monthlyStats: MonthlyCount[]; // últimos 6 meses
}

export async function getGymAnalytics(gymSlug: string): Promise<GymAnalytics | null> {
  if (!supabase) return null;
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return null;

  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("checkins")
    .select("started_at, member_id")
    .eq("gym_id", gym.id)
    .eq("is_valid", true)
    .gte("started_at", since);

  if (error) {
    console.error("No se pudo cargar la analítica del gimnasio:", error);
    return null;
  }

  const rows = data ?? [];

  const dayMap = new Map<string, number>();
  const hourMap = new Map<number, number>();
  const monthMap = new Map<string, { sesiones: number; socios: Set<string> }>();

  for (const row of rows as { started_at: string; member_id: string }[]) {
    const d = new Date(row.started_at);

    const dayKey = d.toISOString().slice(0, 10);
    dayMap.set(dayKey, (dayMap.get(dayKey) ?? 0) + 1);

    hourMap.set(d.getHours(), (hourMap.get(d.getHours()) ?? 0) + 1);

    const monthKey = d.toISOString().slice(0, 7);
    const entry = monthMap.get(monthKey) ?? { sesiones: 0, socios: new Set<string>() };
    entry.sesiones += 1;
    entry.socios.add(row.member_id);
    monthMap.set(monthKey, entry);
  }

  const sessionsByDay: DailyCount[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    sessionsByDay.push({
      date: key,
      label: d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
      count: dayMap.get(key) ?? 0,
    });
  }

  const peakHours: HourlyCount[] = [];
  for (let h = 0; h < 24; h++) {
    peakHours.push({ hour: h, count: hourMap.get(h) ?? 0 });
  }

  const monthlyStats: MonthlyCount[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1); // evita saltos de mes por días distintos
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const entry = monthMap.get(key);
    monthlyStats.push({
      month: d.toLocaleDateString("es-ES", { month: "short" }),
      sesionesValidas: entry?.sesiones ?? 0,
      sociosActivos: entry?.socios.size ?? 0,
    });
  }

  return { sessionsByDay, peakHours, monthlyStats };
}

// Indexa a 100 en el primer mes — misma técnica que usábamos con datos
// de ejemplo, ahora sobre datos reales. Protegido contra división por
// cero (meses sin ningún fichaje todavía).
export function indexMonthlyStats(
  stats: MonthlyCount[]
): (MonthlyCount & { indiceSesiones: number; indiceSocios: number })[] {
  const base = stats[0] ?? { sesionesValidas: 0, sociosActivos: 0 };
  const baseSesiones = Math.max(1, base.sesionesValidas);
  const baseSocios = Math.max(1, base.sociosActivos);
  return stats.map((m) => ({
    ...m,
    indiceSesiones: Math.round((m.sesionesValidas / baseSesiones) * 100),
    indiceSocios: Math.round((m.sociosActivos / baseSocios) * 100),
  }));
}
