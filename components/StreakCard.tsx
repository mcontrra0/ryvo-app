"use client";

import { useEffect, useState } from "react";
import {
  Member,
  WEEKLY_GOAL_OPTIONS,
  STREAK_FREEZE_COST_XP,
  SESSION_MILESTONES,
} from "@/lib/types";
import { updateWeeklyGoal, buyStreakFreeze, getMemberCheckinDays } from "@/lib/memberStore";
import { IconStreak, IconFreeze, IconTrophy, IconLock, IconBadge } from "@/components/icons";

const CALENDAR_WEEKS = 6;
const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  inCurrentMonth: boolean;
}

// Calendario real: semanas como filas, lunes a domingo como columnas —
// igual que cualquier calendario de verdad (o Strava), no una
// cuadrícula genérica de casillas sin más.
function buildCalendarWeeks(): CalendarDay[][] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const dow = (today.getDay() + 6) % 7; // 0=lunes ... 6=domingo
  const start = new Date(today);
  start.setDate(today.getDate() - dow - (CALENDAR_WEEKS - 1) * 7);

  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < CALENDAR_WEEKS; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      week.push({
        date: date.toISOString().slice(0, 10),
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === currentMonth,
      });
    }
    weeks.push(week);
  }
  return weeks;
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

  const calendarWeeks = buildCalendarWeeks();
  const todayStr = new Date().toISOString().slice(0, 10);
  const goalMet = member.currentWeekSessions >= member.weeklyGoalDays;
  const monthLabel = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="rounded-lg border border-podium-gold/30 bg-podium-gold/5 p-5 mb-8 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-podium-gold flex items-center gap-2">
          <IconBadge icon={IconStreak} tone="gold" size="sm" />
          Racha
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
        <p className="text-xs text-podium-asphalt/70 flex items-center gap-2">
          <IconFreeze className="w-4 h-4 shrink-0" />
          Congeladores: <span className="font-semibold">{member.streakFreezes}</span> —
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

      {/* Calendario real de actividad, estilo Strava */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50 mb-2 capitalize">
        {monthLabel}
      </p>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center font-mono text-[9px] uppercase text-podium-asphalt/40"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {calendarWeeks.map((week) => (
          <div key={week[0].date} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const trained = checkinDays.has(day.date);
              const isToday = day.date === todayStr;
              return (
                <div
                  key={day.date}
                  title={day.date}
                  className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-mono ${
                    trained
                      ? "bg-podium-gold/20"
                      : "bg-podium-asphalt/5"
                  } ${isToday ? "ring-2 ring-podium-gold" : ""} ${
                    day.inCurrentMonth ? "text-podium-asphalt/70" : "text-podium-asphalt/25"
                  }`}
                >
                  {trained ? <IconStreak className="w-4 h-4 text-podium-gold" /> : day.dayNumber}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-podium-asphalt/40 mt-2 flex items-center gap-1.5">
        <IconStreak className="w-3 h-3 text-podium-gold" /> = día con sesión válida registrada
      </p>

      {/* Logros personales */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50 mt-5 mb-1">
        Logros — sesiones totales entrenadas
      </p>
      <div className="flex gap-2 flex-wrap">
        {SESSION_MILESTONES.map((milestone) => {
          const unlocked = member.totalSesionesValidas >= milestone;
          return (
            <div
              key={milestone}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-md ${
                unlocked
                  ? "bg-podium-mint/15 border border-podium-mint/40 text-podium-mint"
                  : "bg-podium-asphalt/5 border border-podium-asphalt/10 text-podium-asphalt/30"
              }`}
            >
              <span className="leading-none mb-0.5">
                {unlocked ? (
                  <IconTrophy className="w-4 h-4 text-podium-mint" />
                ) : (
                  <IconLock className="w-4 h-4 text-podium-asphalt/30" />
                )}
              </span>
              <span className="font-mono text-xs font-semibold leading-none">{milestone}</span>
              <span className="font-mono text-[7px] uppercase tracking-wide opacity-70 mt-0.5">
                sesiones
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
