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
  offpeak_enabled: boolean;
  offpeak_start_hour: number;
  offpeak_end_hour: number;
  offpeak_bonus_xp: number;
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

// ---------- Panel de administrador (todos los gimnasios) ----------

export async function getAllGyms(): Promise<GymRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("gyms").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("No se pudieron cargar los gimnasios:", error);
    return [];
  }
  return data as GymRecord[];
}

export async function createGym(data: {
  name: string;
  slug: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase no está configurado" };

  const nfcToken = `${data.slug}-${Math.random().toString(36).slice(2, 10)}`;

  const { error } = await supabase.from("gyms").insert({
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    nfc_token: nfcToken,
  });

  if (error) {
    console.error("No se pudo crear el gimnasio:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateGymIdentity(
  gymId: string,
  patch: { name: string; slug: string }
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase no está configurado" };

  const { error } = await supabase
    .from("gyms")
    .update({ name: patch.name.trim(), slug: patch.slug.trim().toLowerCase() })
    .eq("id", gymId);

  if (error) {
    console.error("No se pudo actualizar el gimnasio:", error);
    return { success: false, error: error.message };
  }
  cache.clear(); // más simple que rastrear qué slug antiguo/nuevo invalidar
  return { success: true };
}

// ⚠️ Borra el gimnasio Y TODO lo que cuelga de él (socios, fichajes,
// premios) — la tabla tiene "on delete cascade" en esas relaciones.
// No hay confirmación aquí dentro a propósito: la pantalla que llama a
// esto es la responsable de pedir confirmación antes.
export async function deleteGym(gymId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase no está configurado" };

  const { error } = await supabase.from("gyms").delete().eq("id", gymId);
  if (error) {
    console.error("No se pudo borrar el gimnasio:", error);
    return { success: false, error: error.message };
  }
  cache.clear();
  return { success: true };
}
