"use client";

import { supabase } from "./supabase";

// ============================================================
// Todo lo que cuelga de un gimnasio (socios, premios, fichajes) usa el
// UUID real de la tabla `gyms` como clave foránea — pero en la URL y
// en el código usamos el slug legible ("box-rinconada"). Este fichero
// hace de puente: resuelve slug → fila completa del gimnasio, con una
// caché en memoria para no consultarlo en cada función.
// ============================================================

export interface GymRecord {
  id: string;
  name: string;
  slug: string;
  min_sessions_per_week: number;
  cashback_enabled: boolean;
  cashback_min_days_per_month: number;
  cashback_discount_euros: number;
  rewards_customized: boolean;
}

const cache = new Map<string, GymRecord>();

export async function getGymBySlug(slug: string): Promise<GymRecord | null> {
  if (cache.has(slug)) return cache.get(slug)!;
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error(`No se pudo cargar el gimnasio "${slug}":`, error);
    return null;
  }

  cache.set(slug, data as GymRecord);
  return data as GymRecord;
}

function invalidate(slug: string) {
  cache.delete(slug);
}

export async function updateGymSettings(
  slug: string,
  patch: Partial<Omit<GymRecord, "id" | "slug" | "name">>
) {
  if (!supabase) return;
  const gym = await getGymBySlug(slug);
  if (!gym) return;
  const { error } = await supabase.from("gyms").update(patch).eq("id", gym.id);
  if (error) console.error("No se pudo actualizar el gimnasio:", error);
  invalidate(slug);
}
