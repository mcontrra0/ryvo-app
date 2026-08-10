"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
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
import { getIndexedMonthlyStats } from "@/lib/monthlyStats";
import MemberRiskRow from "@/components/MemberRiskRow";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import RequireRole from "@/components/RequireRole";
import Logo from "@/components/Logo";
import RewardsEditor from "@/components/RewardsEditor";

// NOTA: Dashboard del CEO/dueño del gimnasio — protegido por login
// (RequireRole role="ceo", ver components/RequireRole.tsx).

type Tab = "riesgo" | "ranking" | "actividad" | "premios";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("riesgo");
  const [members, setMembers] = useState<Member[]>([]);
  const [ranking, setRanking] = useState<Member[]>([]);
  const [muscleTally, setMuscleTally] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      setMembers(await getAllMembers(GYM_ID));
      setRanking(await getRanking(GYM_ID));
      setMuscleTally(await getMuscleTally(GYM_ID));
    })();
  }, []);

  const totalAnomalies = members.reduce((sum, m) => sum + m.anomaliasGps, 0);
  const totalMuscleTaps = Object.values(muscleTally).reduce((a, b) => a + b, 0);

  const withRisk = members.map((m) => ({ m, risk: computeRisk(m) }));
  const activos = withRisk.filter((x) => x.risk === "activo");
  const descenso = withRisk.filter((x) => x.risk === "descenso");
  const riesgo = withRisk.filter((x) => x.risk === "riesgo");

  const titles: Record<Tab, string> = {
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
          <Link
            href="/app"
            className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 hover:text-podium-asphalt underline shrink-0"
          >
            ← Volver
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 mb-8 border-b border-podium-asphalt/10 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
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
                Crecimiento relativo (Mar = 100)
              </p>
              <ChartErrorBoundary
                fallback={
                  <p className="font-mono text-xs text-podium-asphalt/40 py-10 text-center">
                    No se pudo mostrar la gráfica en este dispositivo. Los
                    datos siguen intactos — prueba a recargar la página.
                  </p>
                }
              >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getIndexedMonthlyStats()}>
                  <CartesianGrid stroke="#1b1b1f" strokeOpacity={0.08} vertical={false} />
                  <XAxis
                    dataKey="mes"
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
              Datos de ejemplo — en producción se calculan directamente de tus fichajes reales.
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
