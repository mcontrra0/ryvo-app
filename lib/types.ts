export type RiskLevel = "activo" | "descenso" | "riesgo";

// Escalera de premios — lo único que hace que el juego tenga sentido para
// el socio. El gimnasio decide el premio real detrás de cada nivel.
export interface Reward {
  id: string;
  xpRequired: number;
  title: string;
  announcement?: string; // texto libre y opcional que escribe el CEO (condiciones, dónde canjearlo, etc.)
}

export const REWARDS: Reward[] = [
  { id: "r1", xpRequired: 300, title: "Batido post-entreno gratis" },
  { id: "r2", xpRequired: 1000, title: "10% dto. en tienda del gym" },
  { id: "r3", xpRequired: 2500, title: "Camiseta oficial del box" },
  { id: "r4", xpRequired: 5000, title: "1 mes gratis de cuota" },
  { id: "r5", xpRequired: 8000, title: "Sesión 1:1 con entrenador + merch" },
];

// Racha semanal — no diaria. Exigir venir todos los días sin fallar uno
// castiga a cualquiera que entrene 3-4 veces por semana, que es lo
// normal. En vez de eso, la racha cuenta SEMANAS consecutivas en las
// que se cumple un mínimo de sesiones.
export const MIN_SESSIONS_PER_WEEK = 2;

// Índice de semana simple (no es un cálculo ISO 8601 real, solo un
// contador consistente de "semanas desde una fecha ancla fija") — vale
// para comparar si dos fechas caen en la misma semana o en semanas
// consecutivas, sin necesitar una librería de fechas para esto.
export function getWeekIndex(date: Date): number {
  const ANCHOR = Date.UTC(2024, 0, 1); // lunes 1 de enero de 2024
  const DAY_MS = 24 * 60 * 60 * 1000;
  return Math.floor((date.getTime() - ANCHOR) / (7 * DAY_MS));
}

export interface Member {
  id: string;
  fullName: string;
  memberCode: string;
  totalSesionesValidas: number;
  ultimaSesion: string | null; // ISO datetime
  currentWeekIndex: number | null; // semana (ver getWeekIndex) de la sesión más reciente
  currentWeekSessions: number; // sesiones válidas ya contadas en esa semana
  sesionesUltimos14Dias: number;
  sesiones14a28DiasAtras: number;
  xpTotal: number;
  racha: number; // semanas consecutivas CONFIRMADAS cumpliendo MIN_SESSIONS_PER_WEEK
  lastClaseBonus: string | null; // último bonus de clase otorgado por el monitor
  anomaliasGps: number; // fichajes marcados como "lejos del gym" — solo aviso, no bloqueo
  sessionDaysThisMonth: string[]; // fechas únicas (YYYY-MM-DD) del mes en curso, para el cashback
  cashbackMonthKey: string | null; // "YYYY-MM" del mes que se está contando
  lastComodinClaim: string | null; // última vez que usó el comodín de "olvidé fichar"
}

// Coordenadas del gimnasio piloto — usadas solo como aviso de distancia
// en el momento del fichaje, nunca para bloquear (ver checkin/page.tsx)
export const GYM_COORDS = { lat: 37.4923, lng: -5.9159 }; // San José de la Rinconada
export const GPS_WARN_METERS = 150;

// Regla de cashback — alternativa al XP para gimnasios con socios que no
// conectan con la estética "gamer" (ver feedback de Gemini)
export interface CashbackRule {
  enabled: boolean;
  minDaysPerMonth: number;
  discountEuros: number;
}

export const DEFAULT_CASHBACK_RULE: CashbackRule = {
  enabled: true,
  minDaysPerMonth: 12,
  discountEuros: 5,
};

export const MUSCLE_GROUPS = [
  { id: "pecho_triceps", label: "Pecho/Tríceps", emoji: "🏋️" },
  { id: "pierna", label: "Pierna", emoji: "🦵" },
  { id: "cardio", label: "Cardio", emoji: "🏃" },
  { id: "espalda_biceps", label: "Espalda/Bíceps", emoji: "💪" },
] as const;
export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]["id"];

export interface Checkin {
  id: string;
  memberId: string;
  memberName: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  isValid: boolean | null;
  xpAwarded: number;
  flaggedAnomaly: boolean;
}

export function computeRisk(m: Member): RiskLevel {
  if (!m.ultimaSesion) return "riesgo";

  const diasDesdeUltima =
    (Date.now() - new Date(m.ultimaSesion).getTime()) / (1000 * 60 * 60 * 24);

  // 🔴 En riesgo: 10+ días sin pisar el gym, pero con hábito previo
  if (diasDesdeUltima >= 10 && m.totalSesionesValidas > 0) return "riesgo";

  // 🟡 En descenso: caída de frecuencia >40% frente a las 2 semanas anteriores
  if (m.sesiones14a28DiasAtras > 0) {
    const caida =
      1 - m.sesionesUltimos14Dias / m.sesiones14a28DiasAtras;
    if (caida > 0.4) return "descenso";
  }

  // Socio nuevo con poca sesiones aún: tratar con cautela como descenso, no riesgo
  if (m.totalSesionesValidas <= 1 && diasDesdeUltima > 5) return "descenso";

  return "activo";
}

export const RISK_META: Record<
  RiskLevel,
  { label: string; color: string; bg: string; emoji: string }
> = {
  activo: {
    label: "Activo",
    color: "text-podium-mint",
    bg: "bg-podium-mint/10 border-podium-mint/30",
    emoji: "🟢",
  },
  descenso: {
    label: "En descenso",
    color: "text-podium-gold",
    bg: "bg-podium-gold/10 border-podium-gold/30",
    emoji: "🟡",
  },
  riesgo: {
    label: "En riesgo de baja",
    color: "text-podium-danger",
    bg: "bg-podium-danger/10 border-podium-danger/30",
    emoji: "🔴",
  },
};
