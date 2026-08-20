"use client";

import { Member, getWeekIndex, DEFAULT_WEEKLY_GOAL_DAYS } from "./types";
import { supabase } from "./supabase";
import { getGymBySlug } from "./gymStore";

// ============================================================
// Capa de datos real sobre Supabase. Sustituye a la versión anterior
// en localStorage — la lógica de negocio (racha semanal, cashback,
// comodín de "olvidé fichar") es la MISMA que antes, solo cambia de
// dónde vienen y a dónde van los datos.
//
// ⚠️ Este código no se ha podido probar en vivo contra una base de
// datos real desde este entorno (sin acceso de red a Supabase) — está
// escrito con mucho cuidado siguiendo el esquema exacto de
// supabase/schema.sql, pero la primera prueba de verdad toca hacerla
// en local o en Vercel.
// ============================================================

const DEVICE_MEMBER_KEY = "podium_device_member_id";

export const MIN_MINUTES = 5; // ⚠️ TEMPORAL para pruebas — volver a 45 antes de producción real
const ABANDON_HOURS = 3;
const COMODIN_COOLDOWN_DAYS = 7;
const CLAIM_WINDOW_HOURS = 3;
const CLAIM_XP = 100;

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Solo se admite una sesión VÁLIDA al día por socio — evita que se
// pueda fichar entrada/salida varias veces el mismo día para acumular
// XP de más. Se apoya en `ultimaSesion`, que ya viaja con el socio, así
// que no hace falta ninguna consulta extra a la base de datos.
export function hasValidSessionToday(member: Member): boolean {
  if (!member.ultimaSesion) return false;
  return todayKey(new Date(member.ultimaSesion)) === todayKey();
}

function monthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

interface MemberRow {
  id: string;
  full_name: string;
  member_code: string;
  xp_total: number;
  total_sesiones_validas: number;
  ultima_sesion: string | null;
  current_week_index: number | null;
  current_week_sessions: number;
  racha_semanas: number;
  weekly_goal_days: number;
  streak_freezes: number;
  cashback_month_key: string | null;
  session_days_this_month: string[] | null;
  last_comodin_claim: string | null;
  anomalias_gps: number;
}

interface ActivityRow {
  sesiones_ultimos_14_dias: number;
  sesiones_14_28_dias_atras: number;
}

function rowToMember(row: MemberRow, activity?: ActivityRow): Member {
  return {
    id: row.id,
    fullName: row.full_name,
    memberCode: row.member_code,
    totalSesionesValidas: row.total_sesiones_validas,
    ultimaSesion: row.ultima_sesion,
    currentWeekIndex: row.current_week_index,
    currentWeekSessions: row.current_week_sessions,
    sesionesUltimos14Dias: activity?.sesiones_ultimos_14_dias ?? 0,
    sesiones14a28DiasAtras: activity?.sesiones_14_28_dias_atras ?? 0,
    xpTotal: row.xp_total,
    racha: row.racha_semanas,
    weeklyGoalDays: row.weekly_goal_days ?? DEFAULT_WEEKLY_GOAL_DAYS,
    streakFreezes: row.streak_freezes ?? 0,
    anomaliasGps: row.anomalias_gps,
    sessionDaysThisMonth: row.session_days_this_month ?? [],
    cashbackMonthKey: row.cashback_month_key,
    lastComodinClaim: row.last_comodin_claim,
  };
}

// ---------- Socios ----------

export async function getAllMembers(gymSlug: string): Promise<Member[]> {
  if (!supabase) return [];
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return [];

  const [membersRes, activityRes] = await Promise.all([
    supabase.from("members").select("*").eq("gym_id", gym.id),
    supabase.from("member_activity").select("*").eq("gym_id", gym.id),
  ]);

  if (membersRes.error) {
    console.error("No se pudieron cargar los socios:", membersRes.error);
    return [];
  }

  const activityByMember = new Map<string, ActivityRow>(
    (activityRes.data ?? []).map((a: { member_id: string } & ActivityRow) => [a.member_id, a])
  );

  return (membersRes.data as MemberRow[]).map((row) =>
    rowToMember(row, activityByMember.get(row.id))
  );
}

export async function getMemberById(id: string): Promise<Member | null> {
  if (!supabase) return null;

  const [memberRes, activityRes] = await Promise.all([
    supabase.from("members").select("*").eq("id", id).single(),
    supabase.from("member_activity").select("*").eq("member_id", id).maybeSingle(),
  ]);

  if (memberRes.error || !memberRes.data) return null;
  return rowToMember(memberRes.data as MemberRow, activityRes.data ?? undefined);
}

export function getDeviceMemberId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEVICE_MEMBER_KEY);
}

export function setDeviceMemberId(memberId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEVICE_MEMBER_KEY, memberId);
}

export async function getDeviceMember(): Promise<Member | null> {
  const id = getDeviceMemberId();
  if (!id) return null;
  return getMemberById(id);
}

export async function registerMember(
  gymSlug: string,
  data: { fullName: string; phone: string; pin: string }
): Promise<Member | null> {
  if (!supabase) return null;
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return null;

  const initials = data.fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const memberCode = `${initials}${Math.floor(10 + Math.random() * 90)}`;

  const { data: inserted, error } = await supabase
    .from("members")
    .insert({
      gym_id: gym.id,
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      pin: data.pin,
      member_code: memberCode,
    })
    .select()
    .single();

  if (error || !inserted) {
    console.error("No se pudo registrar el socio:", error);
    return null;
  }

  setDeviceMemberId(inserted.id);
  return rowToMember(inserted as MemberRow);
}

// Acceder desde un dispositivo nuevo (ej. el ordenador de casa) con
// teléfono + PIN, sin necesidad de volver a fichar desde ese aparato.
export async function loginWithPhonePin(
  gymSlug: string,
  phone: string,
  pin: string
): Promise<Member | null> {
  if (!supabase) return null;
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return null;

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("gym_id", gym.id)
    .eq("phone", phone.trim())
    .eq("pin", pin)
    .maybeSingle();

  if (error || !data) return null;

  setDeviceMemberId(data.id);
  return rowToMember(data as MemberRow);
}

// ---------- Racha semanal (objetivo PERSONAL, no del gimnasio) + cashback ----------

function computeWeeklyUpdate(
  current: Member,
  weekIdx: number
): {
  currentWeekIndex: number;
  currentWeekSessions: number;
  racha: number;
  freezeConsumed: boolean;
} {
  const goal = current.weeklyGoalDays;

  if (current.currentWeekIndex === weekIdx) {
    return {
      currentWeekIndex: weekIdx,
      currentWeekSessions: current.currentWeekSessions + 1,
      racha: current.racha,
      freezeConsumed: false,
    };
  }

  const previousWeekMetGoal =
    current.currentWeekIndex !== null && current.currentWeekSessions >= goal;
  const isConsecutiveWeek =
    current.currentWeekIndex !== null && weekIdx === current.currentWeekIndex + 1;

  let racha: number;
  let freezeConsumed = false;

  if (previousWeekMetGoal && isConsecutiveWeek) {
    racha = current.racha + 1;
  } else if (previousWeekMetGoal) {
    racha = 1; // cumplió, pero hubo un hueco de por medio — empieza de nuevo
  } else if (isConsecutiveWeek && current.racha > 0 && current.streakFreezes > 0) {
    // No llegó al objetivo, pero tiene un congelador y hay una racha
    // activa que proteger — el congelador "cuenta" esa semana como
    // cumplida, igual que en Duolingo.
    racha = current.racha + 1;
    freezeConsumed = true;
  } else {
    racha = 0; // sin congelador disponible, la racha se corta
  }

  return { currentWeekIndex: weekIdx, currentWeekSessions: 1, racha, freezeConsumed };
}

function computeUpdatedCashbackDays(
  current: Member,
  today: string
): { days: string[]; monthKey: string } {
  const mKey = monthKey();
  const startingDays = current.cashbackMonthKey === mKey ? current.sessionDaysThisMonth : [];
  const days = startingDays.includes(today) ? startingDays : [...startingDays, today];
  return { days, monthKey: mKey };
}

// XP por sesión general validada (fichaje de entrada + salida, 45+ min)
export async function awardXp(memberId: string, xp: number) {
  if (!supabase) return;
  const current = await getMemberById(memberId);
  if (!current) return;

  const today = todayKey();
  const { days, monthKey: mKey } = computeUpdatedCashbackDays(current, today);
  const weekly = computeWeeklyUpdate(current, getWeekIndex(new Date()));

  const { error } = await supabase
    .from("members")
    .update({
      xp_total: current.xpTotal + xp,
      total_sesiones_validas: current.totalSesionesValidas + 1,
      ultima_sesion: new Date().toISOString(),
      current_week_index: weekly.currentWeekIndex,
      current_week_sessions: weekly.currentWeekSessions,
      racha_semanas: weekly.racha,
      streak_freezes: current.streakFreezes - (weekly.freezeConsumed ? 1 : 0),
      session_days_this_month: days,
      cashback_month_key: mKey,
    })
    .eq("id", memberId);

  if (error) console.error("No se pudo otorgar el XP:", error);
}

// ---------- Fichaje: sesión abierta / abandonada / comodín ----------

export interface OpenCheckin {
  id: string;
  memberId: string;
  startedAt: string;
}

export async function getOpenCheckin(memberId: string): Promise<OpenCheckin | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("checkins")
    .select("id, member_id, started_at")
    .eq("member_id", memberId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, memberId: data.member_id, startedAt: data.started_at };
}

export async function startCheckin(gymSlug: string, memberId: string): Promise<void> {
  if (!supabase) return;
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return;
  const { error } = await supabase.from("checkins").insert({
    gym_id: gym.id,
    member_id: memberId,
    started_at: new Date().toISOString(),
  });
  if (error) console.error("No se pudo iniciar el fichaje:", error);
}

export async function closeCheckin(
  checkinId: string,
  minutes: number,
  valid: boolean,
  xp: number
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("checkins")
    .update({
      ended_at: new Date().toISOString(),
      duration_minutes: minutes,
      is_valid: valid,
      xp_awarded: xp,
    })
    .eq("id", checkinId);
  if (error) console.error("No se pudo cerrar el fichaje:", error);
}

// Si la sesión abierta lleva más de ABANDON_HOURS, se marca como
// abandonada (para poder reclamarla luego con el comodín) en vez de
// dejar que el siguiente tap la cierre con una duración absurda.
export async function checkAndHandleAbandonedCheckin(memberId: string): Promise<boolean> {
  const open = await getOpenCheckin(memberId);
  if (!open || !supabase) return false;

  const hoursElapsed = (Date.now() - new Date(open.startedAt).getTime()) / (1000 * 60 * 60);
  if (hoursElapsed < ABANDON_HOURS) return false;

  const { error } = await supabase
    .from("checkins")
    .update({ ended_at: new Date().toISOString(), abandoned: true, is_valid: false })
    .eq("id", open.id);
  if (error) console.error("No se pudo marcar la sesión como abandonada:", error);
  return true;
}

export async function getPendingClaim(memberId: string): Promise<{
  eligible: boolean;
  checkinId?: string;
  reason?: "no-claim" | "expired" | "cooldown";
}> {
  if (!supabase) return { eligible: false, reason: "no-claim" };

  const cutoff = new Date(Date.now() - CLAIM_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("checkins")
    .select("id, ended_at")
    .eq("member_id", memberId)
    .eq("abandoned", true)
    .eq("claimed", false)
    .gte("ended_at", cutoff)
    .order("ended_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { eligible: false, reason: "no-claim" };

  const member = await getMemberById(memberId);
  if (member?.lastComodinClaim) {
    const daysSince = (Date.now() - new Date(member.lastComodinClaim).getTime()) / 86400000;
    if (daysSince < COMODIN_COOLDOWN_DAYS) return { eligible: false, reason: "cooldown" };
  }

  return { eligible: true, checkinId: data.id };
}

export async function claimForgottenCheckout(
  memberId: string
): Promise<{ success: boolean; xp: number }> {
  const claim = await getPendingClaim(memberId);
  if (!claim.eligible || !claim.checkinId || !supabase) return { success: false, xp: 0 };

  const current = await getMemberById(memberId);
  if (!current) return { success: false, xp: 0 };

  await supabase
    .from("checkins")
    .update({ claimed: true, xp_awarded: CLAIM_XP })
    .eq("id", claim.checkinId);

  await supabase
    .from("members")
    .update({ xp_total: current.xpTotal + CLAIM_XP, last_comodin_claim: new Date().toISOString() })
    .eq("id", memberId);

  return { success: true, xp: CLAIM_XP };
}

// ---------- Aviso de GPS (nunca bloquea, solo marca) ----------

export async function recordGpsAnomaly(memberId: string) {
  if (!supabase) return;
  const current = await getMemberById(memberId);
  if (!current) return;
  await supabase.from("members").update({ anomalias_gps: current.anomaliasGps + 1 }).eq("id", memberId);
}

// ---------- Ranking ----------

export async function getRanking(gymSlug: string): Promise<Member[]> {
  const members = await getAllMembers(gymSlug);
  return [...members].sort((a, b) => b.xpTotal - a.xpTotal);
}

export async function getRankPosition(memberId: string, gymSlug: string): Promise<number> {
  const ranking = await getRanking(gymSlug);
  return ranking.findIndex((m) => m.id === memberId) + 1;
}

// ---------- Objetivo personal de racha + congelador ----------

export async function updateWeeklyGoal(memberId: string, days: number) {
  if (!supabase) return;
  const { error } = await supabase
    .from("members")
    .update({ weekly_goal_days: days })
    .eq("id", memberId);
  if (error) console.error("No se pudo actualizar el objetivo semanal:", error);
}

// Compra un congelador de racha gastando XP. No usa setOverride/caché
// porque siempre parte del dato más fresco posible.
export async function buyStreakFreeze(
  memberId: string,
  costXp: number
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase no está configurado" };

  const current = await getMemberById(memberId);
  if (!current) return { success: false, error: "Socio no encontrado" };
  if (current.xpTotal < costXp) {
    return { success: false, error: "No tienes suficiente XP todavía" };
  }

  const { error } = await supabase
    .from("members")
    .update({
      xp_total: current.xpTotal - costXp,
      streak_freezes: current.streakFreezes + 1,
    })
    .eq("id", memberId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ---------- Calendario de actividad (para el calendario de /mi-ranking) ----------

export async function getMemberCheckinDays(memberId: string, days = 84): Promise<string[]> {
  if (!supabase) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("checkins")
    .select("started_at")
    .eq("member_id", memberId)
    .eq("is_valid", true)
    .gte("started_at", since);

  if (error || !data) return [];

  const uniqueDays = new Set<string>();
  for (const row of data as { started_at: string }[]) {
    uniqueDays.add(new Date(row.started_at).toISOString().slice(0, 10));
  }
  return [...uniqueDays];
}
