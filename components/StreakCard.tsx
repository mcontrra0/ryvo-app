"use client";

import { useEffect, useState } from "react";
import {
  Member,
  WEEKLY_GOAL_OPTIONS,
  STREAK_FREEZE_COST_XP,
  SESSION_MILESTONES,
} from "@/lib/types";
import { updateWeeklyGoal, buyStreakFreeze, getMemberCheckinDays } from "@/lib/memberStore";

const CALENDAR_WEEKS = 8;

function buildCalendarDays(): { date: string; label: string }[] {
  const days: { date: string; label: string }[] = [];
  const today = new Date();
  // Retrocede hasta el lunes de hace (CALENDAR_WEEKS-1) semanas, para
  // que la cuadrícula empiece siempre en lunes.
  const dow = (today.getDay() + 6) % 7; // 0=lunes ... 6=domingo
  const start = new Date(today);
  start.setDate(today.getDate() - dow - (CALENDAR_WEEKS - 1) * 7);

  for (let i = 0; i < CALENDAR_WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    });
  }
  return days;
}

export default function StreakCard({
  member,
  onMemberUpdate,
}: {
  member: Member;
  onMemberUpdate: (m: Member) => void;
}) {
  const [checkinDays, setCheckinDays] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState(false);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);

  useEffect(() => {
    getMemberCheckinDays(member.id, CALENDAR_WEEKS * 7).then((days) =>
      setCheckinDays(new Set(days))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id, member.totalSesionesValidas]);

  async function handleGoalChange(days: number) {
    onMemberUpdate({ ...member, weeklyGoalDays: days });
    await updateWeeklyGoal(member.id, days);
  }

  async function handleBuyFreeze() {
    setBuying(true);
    setBuyMsg(null);
    const result = await buyStreakFreeze(member.id, STREAK_FREEZE_COST_XP);
    setBuying(false);
    if (result.success) {
      onMemberUpdate({
        ...member,
        xpTotal: member.xpTotal - STREAK_FREEZE_COST_XP,
        streakFreezes: member.streakFreezes + 1,
      });
      setBuyMsg("✓ Congelador comprado");
    } else {
      setBuyMsg(result.error ?? "No se pudo comprar");
    }
  }

  const calendarDays = buildCalendarDays();
  const goalMet = member.currentWeekSessions >= member.weeklyGoalDays;

  return (
    <div className="rounded-lg border border-podium-gold/30 bg-podium-gold/5 p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-podium-gold">
          🔥 Racha
        </p>
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl tabular">{member.racha}</span>
          <span className="font-mono text-[10px] text-podium-asphalt/50">semanas</span>
        </div>
      </div>

      {/* Objetivo personal — lo elige el socio, no el gimnasio */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50 mb-2">
        Tu objetivo semanal
      </p>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {WEEKLY_GOAL_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => handleGoalChange(d)}
            className={`w-9 h-9 rounded-md font-mono text-xs tabular transition-colors ${
              member.weeklyGoalDays === d
                ? "bg-podium-gold text-podium-asphalt"
                : "border border-podium-asphalt/20 hover:border-podium-gold"
            }`}
          >
            {d}
          </button>
        ))}
        <span className="self-center font-mono text-[10px] text-podium-asphalt/40 ml-1">
          días/semana
        </span>
      </div>

      <p className="font-mono text-[11px] text-podium-asphalt/60 mb-4">
        Esta semana: {member.currentWeekSessions}/{member.weeklyGoalDays} sesiones
        {goalMet ? " ✓ racha asegurada" : ""}
      </p>

      {/* Congelador de racha */}
      <div className="flex items-center justify-between rounded-md bg-white/60 border border-podium-asphalt/10 px-3 py-2 mb-4">
        <p className="text-xs text-podium-asphalt/70">
          🧊 Congeladores: <span className="font-semibold">{member.streakFreezes}</span> —
          protege una semana floja sin perder la racha
        </p>
        <button
          onClick={handleBuyFreeze}
          disabled={buying || member.xpTotal < STREAK_FREEZE_COST_XP}
          className="shrink-0 font-mono text-[10px] uppercase tracking-widest bg-podium-asphalt text-podium-chalk disabled:opacity-30 disabled:cursor-not-allowed rounded-md px-3 py-1.5"
        >
          {buying ? "…" : `${STREAK_FREEZE_COST_XP} XP`}
        </button>
      </div>
      {buyMsg && <p className="font-mono text-[10px] text-podium-asphalt/50 mb-4">{buyMsg}</p>}

      {/* Calendario de actividad */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50 mb-2">
        Últimas {CALENDAR_WEEKS} semanas
      </p>
      <div
        className="grid gap-1 mb-1"
        style={{ gridTemplateColumns: `repeat(${CALENDAR_WEEKS}, 1fr)` }}
      >
        {Array.from({ length: 7 }, (_, dayOfWeek) =>
          Array.from({ length: CALENDAR_WEEKS }, (_, week) => {
            const day = calendarDays[week * 7 + dayOfWeek];
            const trained = checkinDays.has(day.date);
            const isToday = day.date === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={day.date}
                title={day.label}
                className={`aspect-square rounded-sm ${
                  trained
                    ? "bg-podium-gold"
                    : isToday
                    ? "border border-podium-gold/60"
                    : "bg-podium-asphalt/8"
                }`}
              />
            );
          })
        ).flat()}
      </div>
      <p className="font-mono text-[10px] text-podium-asphalt/40">
        Cada casilla es un día — dorado si entrenaste.
      </p>

      {/* Logros personales */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50 mt-5 mb-2">
        Logros
      </p>
      <div className="flex gap-2 flex-wrap">
        {SESSION_MILESTONES.map((milestone) => {
          const unlocked = member.totalSesionesValidas >= milestone;
          return (
            <div
              key={milestone}
              title={`${milestone} sesiones`}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-md font-mono text-[10px] ${
                unlocked
                  ? "bg-podium-mint/15 border border-podium-mint/40 text-podium-mint"
                  : "bg-podium-asphalt/5 border border-podium-asphalt/10 text-podium-asphalt/30"
              }`}
            >
              <span className="text-base leading-none mb-0.5">{unlocked ? "🏆" : "🔒"}</span>
              {milestone}
            </div>
          );
        })}
      </div>
    </div>
  );
}
