"use client";

import { useEffect, useState } from "react";
import { GYM_NAME } from "@/lib/mockData";
import { Member } from "@/lib/types";
import { getRanking } from "@/lib/memberStore";
import { recentActivity } from "@/lib/recentActivity";
import { announcements } from "@/lib/announcements";
import RequireRole from "@/components/RequireRole";
import Logo from "@/components/Logo";

// ============================================================
// Pensada para correr en un Fire TV Stick en modo kiosko, en la pared
// del gimnasio, vista desde varios metros de distancia — por eso todo
// aquí es deliberadamente grande, de alto contraste y sin ningún texto
// en gris apagado. Sin botones, sin interacción: se actualiza sola.
//
// NOTA: aquí lee el ranking del localStorage del propio navegador para
// la demo. En producción, la TV es un dispositivo distinto al móvil del
// socio, así que este ranking y el ticker de abajo tienen que venir de
// Supabase Realtime (una tabla compartida en la nube) para reaccionar
// al instante cuando alguien ficha desde su móvil — no de localStorage,
// que es local a cada dispositivo.
// ============================================================

const MEDAL_STYLE: Record<number, { bg: string; label: string; height: string }> = {
  1: { bg: "bg-podium-gold", label: "1º", height: "h-72" },
  2: { bg: "bg-podium-silver", label: "2º", height: "h-56" },
  3: { bg: "bg-podium-bronze", label: "3º", height: "h-44" },
};

const RANKING_DURATION_MS = 20000;
const ANNOUNCEMENT_DURATION_MS = 8000;

export default function TvPage() {
  const [ranking, setRanking] = useState<Member[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [screenIndex, setScreenIndex] = useState(0); // 0 = ranking, 1..N = announcements[N-1]

  useEffect(() => {
    setRanking(getRanking());
    setNow(new Date());
    const dataInterval = setInterval(() => setRanking(getRanking()), 5000);
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Rotación automática: ranking (largo) → cada anuncio (corto) → ranking...
  useEffect(() => {
    const duration = screenIndex === 0 ? RANKING_DURATION_MS : ANNOUNCEMENT_DURATION_MS;
    const totalScreens = 1 + announcements.length;
    const timeout = setTimeout(() => {
      setScreenIndex((i) => (i + 1) % totalScreens);
    }, duration);
    return () => clearTimeout(timeout);
  }, [screenIndex]);

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3, 13);
  const tickerItems = [...recentActivity, ...recentActivity]; // loop visual

  return (
    <RequireRole role="tv">
    <main className="h-screen w-full bg-podium-chalk text-podium-asphalt flex flex-col overflow-hidden">
      {/* Cabecera */}
      <header className="flex items-center justify-between px-14 pt-10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-podium-mint animate-pulse" />
          <div>
            <Logo size="sm" className="mb-1" />
            <h1 className="font-display text-5xl uppercase tracking-tight">
              {GYM_NAME}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-podium-asphalt/70">
            Liga en directo
          </span>
          <span className="font-mono text-3xl tabular text-podium-asphalt">
            {now
              ? now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
              : "--:--"}
          </span>
        </div>
      </header>

      <div className="lane-divider mx-14 mb-8" />

      {/* Cuerpo: podio + ranking, o cartelería, según la rotación */}
      {screenIndex === 0 ? (
      <div className="flex-1 flex gap-14 px-14 min-h-0">
        {/* Podio 1-2-3 */}
        <div className="flex items-end gap-6 w-[46%]">
          {[podium[1], podium[0], podium[2]].map((m, idx) => {
            const realPos = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const style = MEDAL_STYLE[realPos];
            if (!m) {
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end">
                  <div className={`w-full ${style.height} rounded-t-2xl bg-podium-asphalt/5`} />
                </div>
              );
            }
            return (
              <div key={m.id} className="flex-1 flex flex-col items-center justify-end">
                <p className="font-display text-3xl uppercase text-center leading-tight mb-1">
                  {m.fullName}
                </p>
                <p className="font-mono text-2xl tabular text-podium-gold mb-4">
                  {m.xpTotal} XP
                </p>
                <div
                  className={`w-full ${style.height} ${style.bg} rounded-t-2xl flex items-start justify-center pt-6 shadow-[0_0_40px_rgba(201,162,39,0.25)]`}
                >
                  <span className="font-display text-6xl text-podium-asphalt">
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resto del ranking — tabla de alto contraste */}
        <div className="flex-1 flex flex-col min-h-0">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-podium-asphalt/70 mb-3">
            Ranking del gimnasio
          </p>
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {rest.map((m, i) => (
              <div
                key={m.id}
                className={`flex items-center justify-between rounded-lg px-5 py-3 ${
                  i % 2 === 0 ? "bg-podium-asphalt/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-5">
                  <span className="font-mono text-2xl tabular text-podium-asphalt/50 w-10">
                    {i + 4}
                  </span>
                  <span className="font-display text-2xl uppercase tracking-tight">
                    {m.fullName}
                  </span>
                </div>
                <span className="font-mono text-2xl tabular text-podium-asphalt">
                  {m.xpTotal} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-14 text-center">
          {(() => {
            const ann = announcements[screenIndex - 1];
            return (
              <>
                <p className="font-mono text-sm uppercase tracking-[0.35em] text-podium-gold mb-6">
                  {ann.eyebrow}
                </p>
                <h2 className="font-display text-7xl uppercase tracking-tight leading-[1.05] mb-8 max-w-4xl">
                  {ann.title}
                </h2>
                <p className="text-2xl text-podium-asphalt/70 max-w-2xl">{ann.body}</p>
              </>
            );
          })()}
          <div className="flex gap-2 mt-14">
            {[0, ...announcements.map((_, i) => i + 1)].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === screenIndex ? "w-8 bg-podium-gold" : "w-1.5 bg-podium-asphalt/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ticker en directo — lo que hace que la pantalla se sienta viva */}
      <footer className="mt-8 bg-podium-track overflow-hidden py-4">
        <div className="flex gap-16 whitespace-nowrap animate-[marquee_28s_linear_infinite]">
          {tickerItems.map((ev, i) => (
            <span
              key={i}
              className="font-display text-2xl uppercase tracking-tight flex items-center gap-3"
            >
              🔥 {ev.memberName}
              <span className="text-podium-asphalt/70 font-mono text-lg normal-case">
                {ev.kind === "clase" ? "clase completada" : "sesión completada"}
              </span>
              <span className="text-podium-asphalt font-semibold">+{ev.xp} XP</span>
            </span>
          ))}
        </div>
      </footer>
    </main>
    </RequireRole>
  );
}
