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
import { computeRisk, Member } from "@/lib/types";
import { getAllMembers, getRanking } from "@/lib/memberStore";
import { getGymAnalytics, indexMonthlyStats, GymAnalytics } from "@/lib/analyticsStore";
import { logout } from "@/lib/auth";
import MemberRiskRow from "@/components/MemberRiskRow";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import RequireRole from "@/components/RequireRole";
import Logo from "@/components/Logo";
import RewardsEditor from "@/components/RewardsEditor";
import { IconOverview, IconShield, IconPodium, IconTrend, IconTrophy, IconAlert, IconUser, IconBadge } from "@/components/icons";

// NOTA: Dashboard del CEO/dueño del gimnasio — protegido por login
// (RequireRole role="ceo", ver components/RequireRole.tsx).

type Tab = "resumen" | "riesgo" | "ranking" | "actividad" | "premios";

const TABS: { id: Tab; label: string; Icon: typeof IconOverview }[] = [
  { id: "resumen", label: "Resumen", Icon: IconOverview },
  { id: "riesgo", label: "Radar", Icon: IconShield },
  { id: "ranking", label: "Ranking", Icon: IconPodium },
  { id: "actividad", label: "Actividad", Icon: IconTrend },
  { id: "premios", label: "Premios", Icon: IconTrophy },
];

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resumen");
  const [members, setMembers] = useState<Member[]>([]);
  const [ranking, setRanking] = useState<Member[]>([]);
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
      setAnalytics(await getGymAnalytics(GYM_ID));
      setLoading(false);
    })();
  }, []);

  const totalAnomalies = members.reduce((sum, m) => sum + m.anomaliasGps, 0);

  const withRisk = members.map((m) => ({ m, risk: computeRisk(m) }));
  const activos = withRisk.filter((x) => x.risk === "activo");
  const descenso = withRisk.filter((x) => x.risk === "descenso");
  const riesgo = withRisk.filter((x) => x.risk === "riesgo");

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
    <main className="flex-1 bg-podium-chalk px-4 sm:px-6 pt-10 pb-24 sm:pb-10 overflow-x-hidden">
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

        {/* Tabs — arriba en pantallas grandes (sm+) */}
        <div className="hidden sm:flex flex-nowrap gap-2 mt-6 mb-8 border-b border-podium-asphalt/10 overflow-x-auto overflow-y-hidden">
          {TABS.map((t) => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              <t.Icon className="w-4 h-4 mr-1" />
              {t.label}
            </TabButton>
          ))}
        </div>

        {tab === "resumen" && (
          <>
            <p className="text-podium-asphalt/60 mb-6 max-w-md">
              Lo esencial de un vistazo — sin entrar en ninguna pestaña más.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <KpiCard label="Socios activos" value={activos.length} icon={IconUser} tone="mint" />
              <KpiCard label="En riesgo" value={riesgo.length} icon={IconAlert} tone="danger" />
              <KpiCard
                label="Sesiones/semana"
                value={sessionsThisWeek}
                icon={IconTrend}
                tone="track"
                trend={weekChangePct}
              />
            </div>

            {!loading && analytics && (
              <>
                <div className="rounded-md border border-podium-asphalt/10 bg-white p-4 mb-4 min-w-0 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
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

                <div className="rounded-md border border-podium-asphalt/10 bg-white p-4 mb-4 min-w-0 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
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
              <p className="font-mono text-[11px] text-podium-asphalt/40 mb-10 flex items-start gap-1.5">
                <IconAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {totalAnomalies} fichaje(s) marcados como "lejos del gimnasio" este
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
            <div className="rounded-md border border-podium-asphalt/10 bg-white p-4 mb-4 min-w-0 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
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
          </>
        )}

        {tab === "premios" && <RewardsEditor />}
      </div>

      {/* Barra de pestañas fija abajo — solo en móvil */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-podium-asphalt border-t border-podium-track/30 flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
              tab === t.id ? "text-podium-track" : "text-podium-chalk/40"
            }`}
          >
            <t.Icon className="w-5 h-5" />
            <span className="font-mono text-[9px] uppercase tracking-wide">{t.label}</span>
          </button>
        ))}
      </nav>
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
      className={`font-mono text-xs uppercase tracking-widest px-1 pb-3 -mb-px border-b-2 transition-colors shrink-0 whitespace-nowrap inline-flex items-center ${
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
  icon,
  tone = "track",
  suffix,
  trend,
}: {
  label: string;
  value: number | string;
  icon: (props: { className?: string }) => React.ReactElement;
  tone?: "track" | "gold" | "mint" | "danger";
  suffix?: string;
  trend?: number;
}) {
  return (
    <div className="rounded-2xl border border-podium-asphalt/10 bg-white px-4 py-4 text-center shadow-[0_2px_10px_rgba(27,27,31,0.07)] transition-transform hover:scale-[1.02]">
      <div className="flex justify-center mb-2">
        <IconBadge icon={icon} tone={tone} />
      </div>
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
    <div className="rounded-2xl border border-podium-asphalt/10 bg-white px-4 py-4 text-center shadow-[0_2px_10px_rgba(27,27,31,0.07)] transition-transform hover:scale-[1.02]">
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
