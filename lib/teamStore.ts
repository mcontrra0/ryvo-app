"use client";

import { supabase } from "./supabase";
import { getGymBySlug } from "./gymStore";

// ============================================================
// Equipos — grupos cerrados de 2-4 socios, creados por ellos
// mismos. Un socio solo puede estar en uno a la vez. No hay una
// "puntuación de grupo" que dependa de una media (eso castigaría a
// todos si uno falla) — cada socio conserva su propio XP y objetivo
// semanal intactos; el equipo solo hace visible el estado de cada
// uno frente a su propio objetivo, y compite en el ranking de grupos
// por la SUMA de XP de sus miembros (un miembro flojo nunca resta,
// solo suma menos).
// ============================================================

export interface TeamMemberStatus {
  id: string;
  fullName: string;
  currentWeekSessions: number;
  weeklyGoalDays: number;
  goalMet: boolean;
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  members: TeamMemberStatus[];
}

export interface TeamRankingEntry {
  id: string;
  name: string;
  memberCount: number;
  totalXp: number;
}

function generateInviteCode(): string {
  // sin caracteres ambiguos (0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function getTeamForMember(memberId: string): Promise<Team | null> {
  if (!supabase) return null;

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("member_id", memberId)
    .maybeSingle();
  if (!membership) return null;

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, invite_code")
    .eq("id", membership.team_id)
    .single();
  if (!team) return null;

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("member_id")
    .eq("team_id", team.id);
  const memberIds = (memberRows ?? []).map((r: { member_id: string }) => r.member_id);
  if (memberIds.length === 0) return null;

  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, current_week_sessions, weekly_goal_days")
    .in("id", memberIds);

  return {
    id: team.id,
    name: team.name,
    inviteCode: team.invite_code,
    members: (members ?? []).map(
      (m: { id: string; full_name: string; current_week_sessions: number; weekly_goal_days: number }) => ({
        id: m.id,
        fullName: m.full_name,
        currentWeekSessions: m.current_week_sessions,
        weeklyGoalDays: m.weekly_goal_days,
        goalMet: m.current_week_sessions >= m.weekly_goal_days,
      })
    ),
  };
}

export async function createTeam(
  gymSlug: string,
  memberId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase no está configurado" };
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return { success: false, error: "Gimnasio no encontrado" };

  const existing = await getTeamForMember(memberId);
  if (existing) return { success: false, error: "Ya perteneces a un equipo" };

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ gym_id: gym.id, name: name.trim(), invite_code: generateInviteCode() })
    .select()
    .single();
  if (error || !team) return { success: false, error: error?.message ?? "No se pudo crear" };

  const { error: memberError } = await supabase
    .from("team_members")
    .insert({ team_id: team.id, member_id: memberId });
  if (memberError) return { success: false, error: memberError.message };

  return { success: true };
}

export async function joinTeamByCode(
  gymSlug: string,
  memberId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase no está configurado" };
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return { success: false, error: "Gimnasio no encontrado" };

  const existing = await getTeamForMember(memberId);
  if (existing) return { success: false, error: "Ya perteneces a un equipo — sal del actual primero" };

  const { data: team, error } = await supabase
    .from("teams")
    .select("id")
    .eq("gym_id", gym.id)
    .eq("invite_code", code.trim().toUpperCase())
    .maybeSingle();
  if (error || !team) return { success: false, error: "Código no válido" };

  const { count } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);
  if ((count ?? 0) >= 4) return { success: false, error: "Ese equipo ya está completo (máx. 4)" };

  const { error: insertError } = await supabase
    .from("team_members")
    .insert({ team_id: team.id, member_id: memberId });
  if (insertError) return { success: false, error: insertError.message };

  return { success: true };
}

export async function leaveTeam(memberId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("team_members").delete().eq("member_id", memberId);
}

export async function getTeamRanking(gymSlug: string): Promise<TeamRankingEntry[]> {
  if (!supabase) return [];
  const gym = await getGymBySlug(gymSlug);
  if (!gym) return [];

  const { data: teams } = await supabase.from("teams").select("id, name").eq("gym_id", gym.id);
  if (!teams || teams.length === 0) return [];

  const teamIds = teams.map((s: { id: string }) => s.id);
  const { data: memberRows } = await supabase
    .from("team_members")
    .select("team_id, member_id")
    .in("team_id", teamIds);

  const allMemberIds = [...new Set((memberRows ?? []).map((r: { member_id: string }) => r.member_id))];
  const { data: members } = await supabase.from("members").select("id, xp_total").in("id", allMemberIds);
  const xpById = new Map((members ?? []).map((m: { id: string; xp_total: number }) => [m.id, m.xp_total]));

  return teams
    .map((s: { id: string; name: string }) => {
      const myMembers = (memberRows ?? []).filter((r: { team_id: string }) => r.team_id === s.id);
      const totalXp = myMembers.reduce(
        (sum: number, r: { member_id: string }) => sum + (xpById.get(r.member_id) ?? 0),
        0
      );
      return { id: s.id, name: s.name, memberCount: myMembers.length, totalXp };
    })
    .sort((a, b) => b.totalXp - a.totalXp);
}
