"use client";

import { Reward, REWARDS as DEFAULT_REWARDS } from "./types";

// ============================================================
// Premios guardados POR GIMNASIO, no de forma global. Ahora mismo solo
// hay un gimnasio en la demo (GYM_ID = "box-rinconada"), pero la
// estructura ya está pensada para cuando haya varios: cada CEO edita y
// ve solo los premios de su propio gimnasio, identificado por su slug.
//
// En producción esto sería una tabla `rewards` en Supabase con una
// columna gym_id — aquí, mientras tanto, se guarda en localStorage bajo
// una clave por gimnasio dentro de un único objeto.
// ============================================================

const REWARDS_KEY = "podium_gym_rewards"; // Record<gymId, Reward[]>

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

function readAll(): Record<string, Reward[]> {
  return readJSON<Record<string, Reward[]>>(REWARDS_KEY, {});
}

// Si el gimnasio todavía no ha personalizado NUNCA sus premios, arranca
// con la escalera de ejemplo. Pero si el CEO ya guardó algo — aunque sea
// una lista vacía porque borró todos los premios a propósito — hay que
// respetar exactamente eso, no volver a los de ejemplo por detrás.
export function getRewardsForGym(gymId: string): Reward[] {
  const all = readAll();
  if (Object.prototype.hasOwnProperty.call(all, gymId)) return all[gymId];
  return DEFAULT_REWARDS;
}

export function saveRewardsForGym(gymId: string, rewards: Reward[]) {
  const all = readAll();
  // guarda siempre ordenado por XP, de menor a mayor — así la escalera
  // que ve el socio en /mi-ranking tiene sentido sin que el CEO tenga
  // que ordenarla él mismo
  all[gymId] = [...rewards].sort((a, b) => a.xpRequired - b.xpRequired);
  writeJSON(REWARDS_KEY, all);
}

export function newBlankReward(): Reward {
  return {
    id: `reward-${Date.now()}`,
    title: "",
    xpRequired: 500,
    announcement: "",
  };
}
