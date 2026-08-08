"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GYM_NAME } from "@/lib/mockData";
import { getTodayCheckins, awardClaseBonus } from "@/lib/memberStore";
import RequireRole from "@/components/RequireRole";
import Logo from "@/components/Logo";

// ============================================================
// Pantalla del monitor/entrenador — sustituye al NFC de honor en la
// sala de clases. En vez de fiarse de que el socio ficha solo si de
// verdad asistió, el monitor (que tiene delante a la clase) marca
// quién ha venido de verdad. Mucho más difícil de falsear.
//
// ⚠️ El PIN de abajo es una simplificación de demo — en producción
// esto necesita autenticación real de personal (no un PIN fijo en el
// código), y la lista debería filtrar solo a quien ha fichado entrada
// hoy Y aún no ha recibido el bonus de clase.
// ============================================================

const DEMO_PIN = "1234";

interface Entry {
  memberId: string;
  memberName: string;
  time: string;
}

function MonitorInner() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [today, setToday] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<{ count: number } | null>(null);

  useEffect(() => {
    if (unlocked) setToday(getTodayCheckins());
  }, [unlocked]);

  function handlePinSubmit() {
    if (pinInput === DEMO_PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  function toggle(memberId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }

  function handleRegisterClass() {
    let count = 0;
    selected.forEach((id) => {
      const result = awardClaseBonus(id);
      if (result.awarded) count += 1;
    });
    setConfirmed({ count });
    setSelected(new Set());
  }

  if (!unlocked) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-podium-chalk text-podium-asphalt px-6 py-16">
        <div className="max-w-xs w-full text-center">
          <Logo size="md" className="justify-center mb-5" />
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-2">
            {GYM_NAME} · Acceso monitor
          </p>
          <h1 className="font-display text-3xl uppercase mb-6">PIN de acceso</h1>
          <input
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            type="password"
            inputMode="numeric"
            placeholder="····"
            className="w-full text-center text-2xl tracking-[0.5em] bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-3 mb-3 focus:outline-none focus:border-podium-track-dark"
          />
          {pinError && (
            <p className="font-mono text-xs text-podium-danger mb-3">PIN incorrecto</p>
          )}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-podium-track hover:bg-podium-track-dark transition-colors rounded-md py-3 font-display text-lg uppercase tracking-wide text-podium-asphalt"
          >
            Entrar
          </button>
          <p className="font-mono text-[10px] text-podium-asphalt/30 mt-4">
            Demo: PIN = 1234
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-podium-chalk px-6 py-10">
      <div className="max-w-lg mx-auto w-full">
        <div className="flex items-start justify-between mb-1">
          <div>
            <Logo size="sm" className="mb-2" />
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-1">
              {GYM_NAME} · Modo monitor
            </p>
            <h1 className="font-display text-4xl uppercase tracking-tight">Clase de hoy</h1>
          </div>
          <Link
            href="/app"
            className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 hover:text-podium-asphalt underline shrink-0 mt-2"
          >
            ← Salir
          </Link>
        </div>
        <p className="text-podium-asphalt/60 mb-8 max-w-md">
          Marca quién ha asistido de verdad a tu clase. Solo aparecen socios
          que han fichado entrada hoy en el gimnasio.
        </p>

        {confirmed && (
          <div className="rounded-md border border-podium-mint/40 bg-podium-mint/10 px-4 py-3 mb-6">
            <p className="font-mono text-sm text-podium-mint">
              ✓ Clase registrada — bonus otorgado a {confirmed.count}{" "}
              {confirmed.count === 1 ? "socio" : "socios"}.
            </p>
          </div>
        )}

        {today.length === 0 ? (
          <p className="font-mono text-sm text-podium-asphalt/40 text-center py-12">
            Nadie ha fichado entrada todavía hoy.
          </p>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {today.map((entry) => {
              const isSelected = selected.has(entry.memberId);
              return (
                <button
                  key={entry.memberId}
                  onClick={() => toggle(entry.memberId)}
                  className={`flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-podium-gold bg-podium-gold/10"
                      : "border-podium-asphalt/15 bg-white hover:border-podium-asphalt/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${
                        isSelected
                          ? "bg-podium-gold border-podium-gold text-podium-asphalt"
                          : "border-podium-asphalt/30"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    <span className="font-medium">{entry.memberName}</span>
                  </div>
                  <span className="font-mono text-xs text-podium-asphalt/40">
                    entrada {entry.time}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleRegisterClass}
          disabled={selected.size === 0}
          className="w-full bg-podium-track hover:bg-podium-track-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md py-4 font-display text-xl uppercase tracking-wide text-podium-asphalt"
        >
          Registrar clase ({selected.size})
        </button>
      </div>
    </main>
  );
}

export default function MonitorPage() {
  return (
    <RequireRole role="monitor">
      <MonitorInner />
    </RequireRole>
  );
}
