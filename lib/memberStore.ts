"use client";

import { Member, MuscleGroupId, getWeekIndex } from "./types";
import { mockMembers, GYM_ID } from "./mockData";
import { getMinSessionsPerWeek } from "./streakStore";

// ============================================================
// Backend simulado en localStorage — ver notas de limitación en el
// README. La lógica de negocio de aquí es la que migrará tal cual a
// funciones de Supabase (RPC / Edge Functions) cuando conectemos de
// verdad.
// ============================================================

const REGISTERED_KEY = "podium_registered_members";
const OVERRIDES_KEY = "podium_member_overrides";
const DEVICE_MEMBER_KEY = "podium_device_member_id";
const OPEN_SESSION_KEY = "podium_open_checkin";
const PENDING_CLAIM_KEY = "podium_pending_claim";
const MUSCLE_TALLY_KEY = "podium_muscle_tally";

export const MIN_MINUTES = 45;
const ABANDON_HOURS = 3; // sesión abierta más de esto = se da por olvidada
const COMODIN_COOLDOWN_DAYS = 7;
const CLAIM_WINDOW_HOURS = 3; // margen para reclamar tras detectarse como olvidada
const CLAIM_XP = 100; // XP base al reclamar una sesión olvidada (sin bonus por duración)

type Overrides = Record<string, Partial<Member>>;

// ---------- Normalización defensiva ----------
// Como esto es un "backend" simulado en localStorage sin migraciones
// reales, cualquier socio registrado con una versión anterior del
// código puede tener campos nuevos ausentes (ej. sessionDaysThisMonth
// no existía antes del módulo de cashback). Sin esto, acceder a esos
// campos revienta la página entera. Todo socio que sale de este
// fichero pasa por aquí primero, venga de mockData, de un registro
// nuevo, o de un registro antiguo guardado hace semanas.
function normalizeMember(partial: Partial<Member> & { id: string }): Member {
  return {
    id: partial.id,
    fullName: partial.fullName ?? "Socio",
    memberCode: partial.memberCode ?? "----",
    totalSesionesValidas: partial.totalSesionesValidas ?? 0,
    ultimaSesion: partial.ultimaSesion ?? null,
    currentWeekIndex: partial.currentWeekIndex ?? null,
    currentWeekSessions: partial.currentWeekSessions ?? 0,
    sesionesUltimos14Dias: partial.sesionesUltimos14Dias ?? 0,
    sesiones14a28DiasAtras: partial.sesiones14a28DiasAtras ?? 0,
    xpTotal: partial.xpTotal ?? 0,
    racha: partial.racha ?? 0,
    anomaliasGps: partial.anomaliasGps ?? 0,
    sessionDaysThisMonth: partial.sessionDaysThisMonth ?? [],
    cashbackMonthKey: partial.cashbackMonthKey ?? null,
    lastComodinClaim: partial.lastComodinClaim ?? null,
  };
}

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

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

// ---------- Socios ----------

export function getAllMembers(): Member[] {
  const registered = readJSON<Member[]>(REGISTERED_KEY, []);
  const overrides = readJSON<Overrides>(OVERRIDES_KEY, {});
  const base = mockMembers.map((m) => normalizeMember({ ...m, ...(overrides[m.id] || {}) }));
  const reg = registered.map((m) => normalizeMember({ ...m, ...(overrides[m.id] || {}) }));
  return [...base, ...reg];
}

export function getMemberById(id: string): Member | undefined {
  return getAllMembers().find((m) => m.id === id);
}

export function getDeviceMemberId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEVICE_MEMBER_KEY);
}

// Usado por el sistema de login de demo (lib/auth.ts) para "entrar como"
// un socio de prueba concreto sin tener que registrarse desde cero.
export function setDeviceMemberId(memberId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEVICE_MEMBER_KEY, memberId);
}

export function getDeviceMember(): Member | null {
  const id = getDeviceMemberId();
  if (!id) return null;
  return getMemberById(id) ?? null;
}

export function registerMember(data: { fullName: string; phone?: string }): Member {
  const registered = readJSON<Member[]>(REGISTERED_KEY, []);
  const initials = data.fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const num = String(registered.length + 1).padStart(2, "0");

  const member: Member = {
    id: `reg-${Date.now()}`,
    fullName: data.fullName.trim(),
    memberCode: `${initials}${num}`,
    totalSesionesValidas: 0,
    ultimaSesion: null,
    currentWeekIndex: null,
    currentWeekSessions: 0,
    sesionesUltimos14Dias: 0,
    sesiones14a28DiasAtras: 0,
    xpTotal: 0,
    racha: 0,
    anomaliasGps: 0,
    sessionDaysThisMonth: [],
    cashbackMonthKey: null,
    lastComodinClaim: null,
  };

  registered.push(member);
  writeJSON(REGISTERED_KEY, registered);
  localStorage.setItem(DEVICE_MEMBER_KEY, member.id);
  return member;
}

function setOverride(memberId: string, patch: Partial<Member>) {
  const overrides = readJSON<Overrides>(OVERRIDES_KEY, {});
  overrides[memberId] = { ...overrides[memberId], ...patch };
  writeJSON(OVERRIDES_KEY, overrides);
}

// ---------- Racha semanal (no diaria — ver comentario en types.ts) ----------

function computeWeeklyUpdate(
  current: Member,
  weekIdx: number,
  minSessions: number
): { currentWeekIndex: number; currentWeekSessions: number; racha: number } {
  // Sigue siendo la misma semana que la última sesión: solo suma una
  // sesión más. La racha (semanas CONFIRMADAS) no cambia todavía — se
  // decide en el momento en que empieza la semana siguiente.
  if (current.currentWeekIndex === weekIdx) {
    return {
      currentWeekIndex: weekIdx,
      currentWeekSessions: current.currentWeekSessions + 1,
      racha: current.racha,
    };
  }

  // Ha empezado una semana nueva. Primero comprobamos si la que
  // acaba de terminar llegó al mínimo de sesiones.
  const previousWeekMetGoal =
    current.currentWeekIndex !== null && current.currentWeekSessions >= minSessions;

  const isConsecutiveWeek =
    current.currentWeekIndex !== null && weekIdx === current.currentWeekIndex + 1;

  let racha: number;
  if (previousWeekMetGoal && isConsecutiveWeek) {
    racha = current.racha + 1; // semana cumplida justo después de otra racha en curso
  } else if (previousWeekMetGoal) {
    racha = 1; // cumplió, pero hubo un hueco de por medio — empieza de nuevo
  } else {
    racha = 0; // la semana anterior no llegó al mínimo — racha cortada
  }

  return { currentWeekIndex: weekIdx, currentWeekSessions: 1, racha };
}

function computeUpdatedCashbackDays(current: Member, today: string): {
  days: string[];
  monthKey: string;
} {
  const mKey = monthKey();
  const startingDays =
    current.cashbackMonthKey === mKey ? current.sessionDaysThisMonth : [];
  const days = startingDays.includes(today) ? startingDays : [...startingDays, today];
  return { days, monthKey: mKey };
}

// XP por sesión general validada (fichaje de entrada + salida, 45+ min)
export function awardXp(memberId: string, xp: number) {
  const current = getMemberById(memberId);
  if (!current) return;

  const today = todayKey();
  const { days, monthKey: mKey } = computeUpdatedCashbackDays(current, today);
  const weekly = computeWeeklyUpdate(current, getWeekIndex(new Date()), getMinSessionsPerWeek(GYM_ID));

  setOverride(memberId, {
    xpTotal: current.xpTotal + xp,
    totalSesionesValidas: current.totalSesionesValidas + 1,
    ultimaSesion: new Date().toISOString(),
    currentWeekIndex: weekly.currentWeekIndex,
    currentWeekSessions: weekly.currentWeekSessions,
    racha: weekly.racha,
    sesionesUltimos14Dias: current.sesionesUltimos14Dias + 1,
    sessionDaysThisMonth: days,
    cashbackMonthKey: mKey,
  });
}

// ---------- Sesión abierta / abandonada / comodín "olvidé fichar" ----------

interface OpenSession {
  memberId: string;
  startedAt: number;
}

interface PendingClaim {
  memberId: string;
  detectedAt: number; // cuándo se detectó como abandonada
  expiresAt: number;
}

export function getOpenSession(): OpenSession | null {
  return readJSON<OpenSession | null>(OPEN_SESSION_KEY, null);
}

export function setOpenSession(session: OpenSession) {
  writeJSON(OPEN_SESSION_KEY, session);
}

export function clearOpenSession() {
  if (typeof window !== "undefined") localStorage.removeItem(OPEN_SESSION_KEY);
}

// Si la sesión abierta lleva más de ABANDON_HOURS, se descarta como
// fichaje "olvidado" y se guarda una reclamación pendiente en vez de
// intentar cerrarla como si el socio acabara de tocar el NFC ahora mismo.
export function checkAndHandleAbandonedSession(): boolean {
  const open = getOpenSession();
  if (!open) return false;
  const hoursElapsed = (Date.now() - open.startedAt) / (1000 * 60 * 60);
  if (hoursElapsed < ABANDON_HOURS) return false;

  const claim: PendingClaim = {
    memberId: open.memberId,
    detectedAt: Date.now(),
    expiresAt: Date.now() + CLAIM_WINDOW_HOURS * 60 * 60 * 1000,
  };
  writeJSON(PENDING_CLAIM_KEY, claim);
  clearOpenSession();
  return true;
}

export function getPendingClaim(memberId: string): {
  eligible: boolean;
  reason?: "no-claim" | "expired" | "cooldown";
} {
  const claim = readJSON<PendingClaim | null>(PENDING_CLAIM_KEY, null);
  if (!claim || claim.memberId !== memberId) return { eligible: false, reason: "no-claim" };
  if (Date.now() > claim.expiresAt) return { eligible: false, reason: "expired" };

  const member = getMemberById(memberId);
  if (member?.lastComodinClaim) {
    const daysSince = (Date.now() - new Date(member.lastComodinClaim).getTime()) / 86400000;
    if (daysSince < COMODIN_COOLDOWN_DAYS) return { eligible: false, reason: "cooldown" };
  }
  return { eligible: true };
}

export function claimForgottenCheckout(memberId: string): { success: boolean; xp: number } {
  const { eligible } = getPendingClaim(memberId);
  if (!eligible) return { success: false, xp: 0 };

  awardXp(memberId, CLAIM_XP);
  setOverride(memberId, { lastComodinClaim: new Date().toISOString() });
  if (typeof window !== "undefined") localStorage.removeItem(PENDING_CLAIM_KEY);
  return { success: true, xp: CLAIM_XP };
}

// ---------- Aviso de GPS (nunca bloquea, solo marca) ----------

export function recordGpsAnomaly(memberId: string) {
  const current = getMemberById(memberId);
  if (!current) return;
  setOverride(memberId, { anomaliasGps: current.anomaliasGps + 1 });
}

// ---------- Grupo muscular (analítica descriptiva, opcional para el socio) ----------

export function recordMuscleGroup(group: MuscleGroupId) {
  const tally = readJSON<Record<string, number>>(MUSCLE_TALLY_KEY, {});
  tally[group] = (tally[group] || 0) + 1;
  writeJSON(MUSCLE_TALLY_KEY, tally);
}

export function getMuscleTally(): Record<string, number> {
  return readJSON<Record<string, number>>(MUSCLE_TALLY_KEY, {});
}

// ---------- Ranking ----------

export function getRanking(): Member[] {
  return [...getAllMembers()].sort((a, b) => b.xpTotal - a.xpTotal);
}

export function getRankPosition(memberId: string): number {
  const ranking = getRanking();
  return ranking.findIndex((m) => m.id === memberId) + 1;
}
