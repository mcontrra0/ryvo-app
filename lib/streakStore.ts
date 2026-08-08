"use client";

import { MIN_SESSIONS_PER_WEEK as DEFAULT_MIN_SESSIONS_PER_WEEK } from "./types";

// Mismo patrón que rewardsStore.ts y cashbackStore.ts: el mínimo de
// sesiones semanales para mantener la racha es POR GIMNASIO. Un box de
// CrossFit puede querer exigir 3, un gimnasio más relajado conformarse
// con 1 — cada CEO decide el suyo.

const KEY = "podium_gym_streak_settings"; // Record<gymId, number>

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getMinSessionsPerWeek(gymId: string): number {
  const all = readJSON<Record<string, number>>(KEY, {});
  if (Object.prototype.hasOwnProperty.call(all, gymId)) return all[gymId];
  return DEFAULT_MIN_SESSIONS_PER_WEEK;
}

export function saveMinSessionsPerWeek(gymId: string, value: number) {
  const all = readJSON<Record<string, number>>(KEY, {});
  all[gymId] = value;
  writeJSON(KEY, all);
}
