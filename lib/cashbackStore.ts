"use client";

import { CashbackRule, DEFAULT_CASHBACK_RULE } from "./types";

// ============================================================
// Misma idea que rewardsStore.ts: la regla de cashback es POR
// GIMNASIO, no global. Y como aprendimos con el bug de los premios,
// distinguimos "nunca se ha tocado" (usar el valor de ejemplo) de
// "el CEO ya guardó algo explícitamente" (respetarlo tal cual, aunque
// sea desactivado) con hasOwnProperty, no comprobando si el valor es
// "vacío".
// ============================================================

const CASHBACK_KEY = "podium_gym_cashback"; // Record<gymId, CashbackRule>

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

function readAll(): Record<string, CashbackRule> {
  return readJSON<Record<string, CashbackRule>>(CASHBACK_KEY, {});
}

export function getCashbackRuleForGym(gymId: string): CashbackRule {
  const all = readAll();
  if (Object.prototype.hasOwnProperty.call(all, gymId)) return all[gymId];
  return DEFAULT_CASHBACK_RULE;
}

export function saveCashbackRuleForGym(gymId: string, rule: CashbackRule) {
  const all = readAll();
  all[gymId] = rule;
  writeJSON(CASHBACK_KEY, all);
}
