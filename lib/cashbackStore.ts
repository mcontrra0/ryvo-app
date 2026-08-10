"use client";

import { CashbackRule, DEFAULT_CASHBACK_RULE } from "./types";
import { getGymBySlug, updateGymSettings } from "./gymStore";

// La regla de cashback vive como columnas en la fila del gimnasio
// (tabla `gyms`) — no hace falta una tabla aparte para un solo
// registro de ajustes por gimnasio.

export async function getCashbackRuleForGym(gymSlug: string): Promise<CashbackRule> {
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return DEFAULT_CASHBACK_RULE;
  return {
    enabled: gym.cashback_enabled,
    minDaysPerMonth: gym.cashback_min_days_per_month,
    discountEuros: Number(gym.cashback_discount_euros),
  };
}

export async function saveCashbackRuleForGym(gymSlug: string, rule: CashbackRule) {
  await updateGymSettings(gymSlug, {
    cashback_enabled: rule.enabled,
    cashback_min_days_per_month: rule.minDaysPerMonth,
    cashback_discount_euros: rule.discountEuros,
  });
}
