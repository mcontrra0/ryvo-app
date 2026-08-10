"use client";

import { MIN_SESSIONS_PER_WEEK as DEFAULT_MIN_SESSIONS_PER_WEEK } from "./types";
import { getGymBySlug, updateGymSettings } from "./gymStore";

// Mismo patrón que cashbackStore.ts: el mínimo de sesiones semanales
// para mantener la racha es una columna más de la fila del gimnasio.

export async function getMinSessionsPerWeek(gymSlug: string): Promise<number> {
  const gym = await getGymBySlug(gymSlug);
  return gym?.min_sessions_per_week ?? DEFAULT_MIN_SESSIONS_PER_WEEK;
}

export async function saveMinSessionsPerWeek(gymSlug: string, value: number) {
  await updateGymSettings(gymSlug, { min_sessions_per_week: value });
}
