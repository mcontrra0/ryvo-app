"use client";

import { getGymBySlug, updateGymSettings } from "./gymStore";

// Mismo patrón que cashbackStore.ts y streakStore.ts: la regla de
// horas valle vive como columnas en la fila del propio gimnasio.

export interface OffpeakRule {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
  bonusXp: number;
}

export const DEFAULT_OFFPEAK_RULE: OffpeakRule = {
  enabled: false,
  startHour: 11,
  endHour: 16,
  bonusXp: 30,
};

export async function getOffpeakRuleForGym(gymSlug: string): Promise<OffpeakRule> {
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return DEFAULT_OFFPEAK_RULE;
  return {
    enabled: gym.offpeak_enabled,
    startHour: gym.offpeak_start_hour,
    endHour: gym.offpeak_end_hour,
    bonusXp: gym.offpeak_bonus_xp,
  };
}

export async function saveOffpeakRuleForGym(gymSlug: string, rule: OffpeakRule) {
  await updateGymSettings(gymSlug, {
    offpeak_enabled: rule.enabled,
    offpeak_start_hour: rule.startHour,
    offpeak_end_hour: rule.endHour,
    offpeak_bonus_xp: rule.bonusXp,
  });
}

// true si la hora dada (0-23) cae dentro de la ventana valle. Soporta
// también ventanas que cruzan la medianoche (ej. 22h-6h) por si algún
// gimnasio 24h quiere premiar la noche.
export function isWithinOffpeak(hour: number, rule: OffpeakRule): boolean {
  if (!rule.enabled) return false;
  if (rule.startHour === rule.endHour) return false;
  if (rule.startHour < rule.endHour) {
    return hour >= rule.startHour && hour < rule.endHour;
  }
  return hour >= rule.startHour || hour < rule.endHour;
}
