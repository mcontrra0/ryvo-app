"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GYM_NAME, GYM_ID } from "@/lib/mockData";
import { computeRisk, Member, MUSCLE_GROUPS } from "@/lib/types";
import { getAllMembers, getRanking, getMuscleTally } from "@/lib/memberStore";
import { getGymAnalytics, indexMonthlyStats, GymAnalytics } from "@/lib/analyticsStore";
import { logout } from "@/lib/auth";
import MemberRiskRow from "@/components/MemberRiskRow";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import RequireRole from "@/components/RequireRole";
import Logo from "@/components/Logo";
import RewardsEditor from "@/components/RewardsEditor";

// NOTA: Dashboard del CEO/dueño del gimnasio — protegido por login
// (RequireRole role="ceo", ver components/RequireRole.tsx).

type Tab = "resumen" | "riesgo" | "ranking" | "actividad" | "premios";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resumen");
  const [members, setMembers] = useState<Member[]>([]);
  const [ranking, setRanking] = useState<Member[]>([]);
  const [muscleTally, setMuscleTally] = useState<Record<string, number>>({});
  const [analytics, setAnalytics] = useState<GymAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    (async () => {
      setMembers(await getAllMembers(GYM_ID));
      setRanking(await getRanking(GYM_ID));
      setMuscleTally(await getMuscleTally(GYM_ID));
      setAnalytics(await getGymAnalytics(GYM_ID));
      setLoading(false);
    })();
  }, []);

  const totalAnomalies = members.reduce((sum, m) => sum + m.anomaliasGps, 0);
  const totalMuscleTaps = Object.values(muscleTally).reduce((a, b) => a + b, 0);

  const withRisk = members.map((m) => ({ m, risk: computeRisk(m) }));
  const activos = withRisk.filter((x) => x.risk === "activo");
  const descenso = withRisk.filter((x) => x.risk === "descenso");
  const riesgo = withRisk.filter((x) => x.risk === "riesgo");

  // Solo cuenta socios con racha activa (>0) — si la calculásemos
  // sobre todos, los socios inactivos (racha=0) arrastrarían la media
  // hacia abajo y el número dejaría de significar nada útil.
  const membersWithStreak = members.filter((m) => m.racha > 0);
  const avgRacha = membersWithStreak.length
    ? Math.round(
        (membersWithStreak.reduce((sum, m) => sum + m.racha, 0) / membersWithStreak.length) * 10
      ) / 10
    : 0;

  const sessionsThisWeek = analytics?.sessionsByDay.slice(7, 14).reduce((s, d) => s + d.count, 0) ?? 0;
  const sessionsPrevWeek = analytics?.sessionsByDay.slice(0, 7).reduce((s, d) => s + d.count, 0) ?? 0;
  const weekChangePct =
    sessionsPrevWeek > 0
      ? Math.round(((sessionsThisWeek - sessionsPrevWeek) / sessionsPrevWeek) * 100)
      : sessionsThisWeek > 0
      ? 100
      : 0;

  const busiestHour = analytics?.peakHours.reduce(
    (best, h) => (h.count > best.count ? h : best),
    { hour: 0, count: 0 }
  );

  const titles: Record<Tab, string> = {
    resumen: "Resumen",
    riesgo: "Radar de riesgo",
    ranking: "Ranking de jugadores",
    actividad: "Actividad mensual",
    premios: "Premios del gimnasio",
  };

  return (
    <RequireRole role="ceo">
    <main className="flex-1 bg-podium-chalk px-4 sm:px-6 py-10 overflow-x-hidden">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
          <div>
            <Logo size="sm" className="mb-2" />
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-1">
              {GYM_NAME} · Panel del dueño
            </p>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
              {titles[tab]}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 hover:text-podium-asphalt underline shrink-0"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-nowrap gap-2 mt-6 mb-8 border-b border-podium-asphalt/10 overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabButton active={tab === "resumen"} onClick={() => setTab("resumen")}>
            Resumen
          </TabButton>
          <TabButton active={tab === "riesgo"} onClick={() => setTab("riesgo")}>
            Radar de riesgo
          </TabButton>
          <TabButton active={tab === "ranking"} onClick={() => setTab("ranking")}>
            Ranking
          </TabButton>
          <TabButton active={tab === "actividad"} onClick={() => setTab("actividad")}>
            Actividad
          </TabButton>
          <TabButton active={tab === "premios"} onClick={() => setTab("premios")}>
            Premios
          </TabButton>
        </div>

        {tab === "resumen" && (
          <>
            <p className="text-podium-asphalt/60 mb-6 max-w-md">
              Lo esencial de un vistazo — sin entrar en ninguna pestaña más.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <KpiCard label="Socios activos" value={activos.length} emoji="🟢" />
              <KpiCard label="En riesgo" value={riesgo.length} emoji="🔴" />
              <KpiCard label="Racha media (activos)" value={`${avgRacha}`} suffix="sem." emoji="🔥" />
              <KpiCard
                label="Sesiones/semana"
                value={sessionsThisWeek}
                emoji="📈"
                trend={weekChangePct}
              />
            </div>

            {!loading && analytics && (
              <>
                <div className="rounded-md border border-podium-asphalt/10 bg-white p-4 mb-4 min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-4">
                    Sesiones por día — últimos 14 días
                  </p>
                  <ChartErrorBoundary fallback={<ChartFallback />}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.sessionsByDay}>
                        <CartesianGrid stroke="#1b1b1f" strokeOpacity={0.08} vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#1b1b1f99" }}
                          axisLine={{ stroke: "#1b1b1f22" }}
                          tickLine={false}
                          interval={1}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#1b1b1f99" }}
                          axisLine={false}
                          tickLine={false}
                          width={28}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#8fd40015" }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #1b1b1f1a", fontSize: 12 }}
                        />
                        <Bar dataKey="count" name="Sesiones" fill="#6ea300" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartErrorBoundary>
                </div>

                <div className="rounded-md border border-podium-asphalt/10 bg-white p-4 mb-4 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50">
                      Horas punta
                    </p>
                    {busiestHour && busiestHour.count > 0 && (
                      <p className="font-mono text-[11px] text-podium-asphalt/50">
                        Pico: <span className="text-podium-asphalt font-semibold">{busiestHour.hour}h</span>
                      </p>
                    )}
                  </div>
                  <ChartErrorBoundary fallback={<ChartFallback />}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analytics.peakHours}>
                        <CartesianGrid stroke="#1b1b1f" strokeOpacity={0.08} vertical={false} />
                        <XAxis
                          dataKey="hour"
                          tickFormatter={(h) => `${h}h`}
                          tick={{ fontSize: 10, fill: "#1b1b1f99" }}
                          axisLine={{ stroke: "#1b1b1f22" }}
                          tickLine={false}
                          interval={2}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#1b1b1f99" }}
                          axisLine={false}
                          tickLine={false}
                          width={28}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#c9a22715" }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #1b1b1f1a", fontSize: 12 }}
                          labelFormatter={(h) => `${h}h`}
                        />
                        <Bar dataKey="count" name="Fichajes" fill="#c9a227" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartErrorBoundary>
                  <p className="font-mono text-[10px] text-podium-asphalt/30 mt-2">
                    Útil para decidir cuándo reforzar personal o abrir clases nuevas.
                  </p>
                </div>
              </>
            )}

            {riesgo.length > 0 && (
              <div className="rounded-md border border-podium-danger/30 bg-podium-danger/5 px-4 py-3 mt-4">
                <p className="font-mono text-xs text-podium-danger">
                  🔴 Tienes {riesgo.length} socio(s) en riesgo real de baja —{" "}
                  <button onClick={() => setTab("riesgo")} className="underline font-semibold">
                    revísalos ahora
                  </button>
                </p>
              </div>
            )}
          </>
        )}

        {tab === "riesgo" && (
          <>
            <p className="text-podium-asphalt/60 mb-8 max-w-md">
              Cada lunes verás este mismo resumen por email. Nadie tiene que
              revisar reservas ni hojas de cálculo — el sistema te avisa
              antes de que un socio se vaya.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <SummaryCard label="Activos" value={activos.length} emoji="🟢" />
              <SummaryCard label="En descenso" value={descenso.length} emoji="🟡" />
              <SummaryCard label="En riesgo" value={riesgo.length} emoji="🔴" />
            </div>

            {totalAnomalies > 0 && (
              <p className="font-mono text-[11px] text-podium-asphalt/40 mb-10">
                📍 {totalAnomalies} fichaje(s) marcados como "lejos del gimnasio" este
                periodo — solo aviso, no bloquean el XP. Revísalo si un mismo socio se
                repite mucho.
              </p>
            )}

            {riesgo.length > 0 && (
              <Section title="🔴 En riesgo de baja — actúa ya">
                {riesgo.map(({ m }) => (
                  <MemberRiskRow key={m.id} member={m} />
                ))}
              </Section>
            )}
            {descenso.length > 0 && (
              <Section title="🟡 En descenso — vigila esta semana">
                {descenso.map(({ m }) => (
                  <MemberRiskRow key={m.id} member={m} />
                ))}
              </Section>
            )}
            {activos.length > 0 && (
              <Section title="🟢 Activos">
                {activos.map(({ m }) => (
                  <MemberRiskRow key={m.id} member={m} />
                ))}
              </Section>
            )}
          </>
        )}

        {tab === "ranking" && (
          <>
            <p className="text-podium-asphalt/60 mb-8 max-w-md">
              Lo mismo que ven tus socios en la pantalla de la sala, con más
              detalle: sesiones válidas de cada uno.
            </p>
            <div className="flex flex-col gap-1.5">
              {ranking.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-podium-asphalt/10 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm w-6 text-podium-asphalt/40 tabular">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{m.fullName}</p>
                      <p className="font-mono text-[11px] text-podium-asphalt/40">
                        {m.totalSesionesValidas} sesiones válidas
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm tabular text-podium-asphalt/70">
                    {m.xpTotal} XP
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "actividad" && (
          <>
            <p className="text-podium-asphalt/60 mb-8 max-w-md">
              Sesiones válidas y socios activos parten de escalas muy
              distintas, así que aquí las vemos indexadas a 100 en el
              primer mes — así se compara el ritmo de crecimiento de una
              frente a la otra de un vistazo.
            </p>
            <div className="rounded-md border border-podium-asphalt/10 bg-white p-4 mb-4 min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-4">
                Crecimiento relativo (primer mes = 100)
              </p>
              <ChartErrorBoundary fallback={<ChartFallback />}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics ? indexMonthlyStats(analytics.monthlyStats) : []}>
                  <CartesianGrid stroke="#1b1b1f" strokeOpacity={0.08} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#1b1b1f99" }}
                    axisLine={{ stroke: "#1b1b1f22" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#1b1b1f99" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<ActivityTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                    formatter={(value) =>
                      value === "indiceSesiones" ? "Sesiones válidas" : "Socios activos"
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="indiceSesiones"
                    stroke="#a32638"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#a32638" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="indiceSocios"
                    stroke="#c9a227"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#c9a227" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </ChartErrorBoundary>
            </div>
            <p className="font-mono text-[10px] text-podium-asphalt/30 mb-8">
              Calculado a partir de tus fichajes reales de los últimos 6 meses.
            </p>

            {totalMuscleTaps > 0 && (
              <>
                <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-4">
                  Qué entrena la gente (auto-declarado al fichar salida)
                </p>
                <div className="flex flex-col gap-2">
                  {MUSCLE_GROUPS.map((g) => {
                    const count = muscleTally[g.id] || 0;
                    const pct = totalMuscleTaps ? Math.round((count / totalMuscleTaps) * 100) : 0;
                    return (
                      <div key={g.id} className="flex items-center gap-3">
                        <span className="w-32 text-sm shrink-0">
                          {g.emoji} {g.label}
                        </span>
                        <div className="flex-1 h-3 rounded-full bg-podium-asphalt/10 overflow-hidden">
                          <div
                            className="h-full bg-podium-track rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-podium-asphalt/50 w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {tab === "premios" && <RewardsEditor />}
      </div>
    </main>
    </RequireRole>
  );
}

function ChartFallback() {
  return (
    <p className="font-mono text-xs text-podium-asphalt/40 py-10 text-center">
      No se pudo mostrar la gráfica en este dispositivo. Los datos siguen
      intactos — prueba a recargar la página.
    </p>
  );
}

function ActivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: { sesionesValidas: number; sociosActivos: number } }[];
  label?: string;
}) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-podium-asphalt/10 bg-white px-3 py-2 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-1">
        {label}
      </p>
      <p className="text-xs" style={{ color: "#a32638" }}>
        {d.sesionesValidas} sesiones válidas
      </p>
      <p className="text-xs" style={{ color: "#c9a227" }}>
        {d.sociosActivos} socios activos
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs uppercase tracking-widest px-1 pb-3 -mb-px border-b-2 transition-colors shrink-0 whitespace-nowrap ${
        active
          ? "border-podium-track-dark text-podium-asphalt"
          : "border-transparent text-podium-asphalt/40 hover:text-podium-asphalt/70"
      }`}
    >
      {children}
    </button>
  );
}

function KpiCard({
  label,
  value,
  emoji,
  suffix,
  trend,
}: {
  label: string;
  value: number | string;
  emoji: string;
  suffix?: string;
  trend?: number;
}) {
  return (
    <div className="rounded-md border border-podium-asphalt/10 bg-white px-4 py-4 text-center">
      <p className="text-xl mb-1">{emoji}</p>
      <p className="font-display text-2xl tabular">
        {value}
        {suffix && <span className="text-sm font-sans ml-1 text-podium-asphalt/50">{suffix}</span>}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50">
        {label}
      </p>
      {trend !== undefined && trend !== 0 && (
        <p
          className={`font-mono text-[10px] mt-1 ${
            trend > 0 ? "text-podium-mint" : "text-podium-danger"
          }`}
        >
          {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}% vs. semana anterior
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  return (
    <div className="rounded-md border border-podium-asphalt/10 bg-white px-4 py-4 text-center">
      <p className="text-xl mb-1">{emoji}</p>
      <p className="font-display text-3xl tabular">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50">
        {label}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-3">
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
