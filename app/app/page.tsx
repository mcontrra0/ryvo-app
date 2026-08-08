"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GYM_NAME } from "@/lib/mockData";
import { getSession, logout, Session } from "@/lib/auth";
import Logo from "@/components/Logo";

// ============================================================
// Esta es la "página de inicio" — pero a diferencia de antes, ya NO es
// un selector libre de los 5 flujos. Ahora comprueba quién ha iniciado
// sesión y solo muestra lo que corresponde a su rol. En producción,
// casi nadie llega aquí manualmente (cada perfil tiene su camino
// directo: NFC, URL fija de la TV, etc.) — esta pantalla es sobre todo
// el punto de entrada para el rol "socio", que sí tiene dos destinos
// entre los que elegir.
// ============================================================

export default function AppEntryPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!session) return null;

  return (
    <main className="flex-1 flex flex-col bg-podium-chalk text-podium-asphalt">
      <div className="flex-1 flex flex-col justify-center px-6 py-16 max-w-md mx-auto w-full">
        <Logo size="md" className="mb-6" />
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-3">
          {GYM_NAME} · Sesión: {session.displayName}
        </p>
        <h1 className="font-display text-5xl leading-[0.95] uppercase tracking-tight mb-10">
          ¿A dónde vas?
        </h1>

        <nav className="flex flex-col gap-3">
          {session.role === "socio" && (
            <>
              <Link
                href="/checkin?gym=box-rinconada"
                className="group flex items-center justify-between rounded-md border border-podium-asphalt/15 px-5 py-4 hover:border-podium-track-dark hover:bg-podium-track/10 transition-colors"
              >
                <span>
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-1">
                    Socio · llega tocando el NFC
                  </span>
                  <span className="font-display text-2xl uppercase">Fichar</span>
                </span>
                <span className="text-podium-track-dark text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href="/mi-ranking"
                className="group flex items-center justify-between rounded-md border border-podium-asphalt/15 px-5 py-4 hover:border-podium-mint hover:bg-podium-mint/10 transition-colors"
              >
                <span>
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-1">
                    Socio · consulta su progreso
                  </span>
                  <span className="font-display text-2xl uppercase">Mi ranking</span>
                </span>
                <span className="text-podium-mint text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </>
          )}

          {session.role === "ceo" && (
            <Link
              href="/dashboard"
              className="group flex items-center justify-between rounded-md border border-podium-asphalt/15 px-5 py-4 hover:border-podium-gold hover:bg-podium-gold/10 transition-colors"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-1">
                  CEO / dueño del gimnasio
                </span>
                <span className="font-display text-2xl uppercase">Dashboard</span>
              </span>
              <span className="text-podium-gold text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {session.role === "monitor" && (
            <Link
              href="/monitor"
              className="group flex items-center justify-between rounded-md border border-podium-asphalt/15 px-5 py-4 hover:border-podium-track-dark hover:bg-podium-track/10 transition-colors"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-1">
                  Monitor · valida asistencia a su clase
                </span>
                <span className="font-display text-2xl uppercase">Modo monitor</span>
              </span>
              <span className="text-podium-track-dark text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {session.role === "tv" && (
            <Link
              href="/tv"
              className="group flex items-center justify-between rounded-md border border-podium-asphalt/15 px-5 py-4 hover:border-podium-silver hover:bg-podium-silver/10 transition-colors"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-1">
                  Pantalla de sala (Fire TV Stick)
                </span>
                <span className="font-display text-2xl uppercase">Modo TV</span>
              </span>
              <span className="text-podium-silver text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 font-mono text-xs uppercase tracking-widest text-podium-asphalt/40 hover:text-podium-asphalt underline self-start"
        >
          Cerrar sesión
        </button>
      </div>

      <footer className="border-t border-podium-asphalt/10 px-6 py-4 text-center">
        <p className="font-mono text-[11px] text-podium-asphalt/40">
          Prototipo local · datos guardados en tu navegador, sin base de datos real todavía
        </p>
      </footer>
    </main>
  );
}
