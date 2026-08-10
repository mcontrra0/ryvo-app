"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GYM_NAME } from "@/lib/mockData";
import { GYM_COORDS, GPS_WARN_METERS, MUSCLE_GROUPS, MuscleGroupId } from "@/lib/types";
import {
  getDeviceMember,
  registerMember,
  awardXp,
  getRankPosition,
  getOpenCheckin,
  startCheckin,
  closeCheckin,
  checkAndHandleAbandonedCheckin,
  recordGpsAnomaly,
  recordMuscleGroup,
  MIN_MINUTES,
} from "@/lib/memberStore";
import RegisterForm from "@/components/RegisterForm";
import Logo from "@/components/Logo";

// ============================================================
// Destino real de la URL grabada en el NFC/QR de la entrada. El socio
// no abre ninguna app ni pulsa nada dentro de una — aterriza aquí al
// tocar, y la página decide sola qué hacer:
//
//  0. ¿La sesión abierta lleva más de 3h? → se da por olvidada, se
//     guarda como reclamación pendiente (ver /mi-ranking), y el tap
//     actual se trata como una entrada nueva.
//  1. ¿Es la primera vez en este móvil? → registro rápido de 1 paso.
//  2. ¿No hay sesión abierta? → Tap de ENTRADA.
//  3. ¿Hay sesión abierta? → Tap de SALIDA.
//
// El aviso de GPS es solo eso, un aviso: si el navegador da una
// ubicación lejana al gimnasio, se anota como anomalía para que la vea
// el dueño — nunca bloquea el fichaje ni penaliza al socio en el acto,
// porque el GPS en interiores falla demasiado como para confiar en él
// al 100%.
// ============================================================

type Phase = "loading" | "register" | "tap-in-result" | "tap-out-result";

interface TapOutResult {
  minutes: number;
  valid: boolean;
  xp: number;
  rankPosition?: number;
  checkinId: string;
}

function checkGpsSoftly(memberId: string) {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const distance = haversineMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        GYM_COORDS.lat,
        GYM_COORDS.lng
      );
      if (distance > GPS_WARN_METERS) recordGpsAnomaly(memberId);
    },
    () => {
      /* permiso denegado o no disponible: no penalizamos por esto */
    },
    { timeout: 4000, maximumAge: 60000 }
  );
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function CheckinContent() {
  const params = useSearchParams();
  const gymSlug = params.get("gym") ?? "box-rinconada";

  const [phase, setPhase] = useState<Phase>("loading");
  const [memberName, setMemberName] = useState("");
  const [tapOutResult, setTapOutResult] = useState<TapOutResult | null>(null);
  const [muscleGroupSaved, setMuscleGroupSaved] = useState<MuscleGroupId | null>(null);

  async function processGeneralTap(memberId: string, name: string) {
    await checkAndHandleAbandonedCheckin(memberId); // por si la sesión abierta era de hace horas

    const open = await getOpenCheckin(memberId);

    if (!open) {
      // TAP 1 — entrada
      await startCheckin(gymSlug, memberId);
      checkGpsSoftly(memberId);
      setMemberName(name);
      setPhase("tap-in-result");
      return;
    }

    // TAP 2 — salida
    const minutes = Math.floor((Date.now() - new Date(open.startedAt).getTime()) / 60000);
    const valid = minutes >= MIN_MINUTES;
    const xp = valid ? 100 + Math.min(minutes - MIN_MINUTES, 30) : 0;

    await closeCheckin(open.id, minutes, valid, xp);
    if (valid) await awardXp(open.memberId, xp, gymSlug);

    setTapOutResult({
      minutes,
      valid,
      xp,
      checkinId: open.id,
      rankPosition: valid ? await getRankPosition(open.memberId, gymSlug) : undefined,
    });
    setPhase("tap-out-result");
  }

  useEffect(() => {
    (async () => {
      const existing = await getDeviceMember();
      if (!existing) {
        setPhase("register");
        return;
      }
      await processGeneralTap(existing.id, existing.fullName);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegisterComplete(data: { fullName: string; phone?: string }) {
    const member = await registerMember(gymSlug, data);
    if (!member) return; // TODO: mostrar error si Supabase no está configurado/falla
    await processGeneralTap(member.id, member.fullName);
  }

  async function handleMuscleGroupPick(group: MuscleGroupId) {
    if (!tapOutResult) return;
    await recordMuscleGroup(tapOutResult.checkinId, group);
    setMuscleGroupSaved(group);
  }

  return (
    <main className="flex-1 flex flex-col bg-podium-chalk text-podium-asphalt px-6 py-10">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
        <Logo size="md" className="justify-center mb-6" />
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-6 text-center">
          {GYM_NAME} · {gymSlug}
        </p>

        {phase === "loading" && (
          <p className="text-center text-podium-asphalt/40 font-mono text-sm">Leyendo tag…</p>
        )}

        {phase === "register" && <RegisterForm onComplete={handleRegisterComplete} />}

        {phase === "tap-in-result" && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-2 h-2 rounded-full bg-podium-mint animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50">
              ¡Bienvenido/a, {memberName.split(" ")[0]}!
            </p>
            <p className="font-display text-3xl uppercase tracking-tight">
              Entrenamiento iniciado
            </p>
            <p className="text-podium-asphalt/60 text-sm max-w-xs">
              Vuelve a tocar el NFC al salir para validar la sesión y ganar
              XP. Necesitas al menos {MIN_MINUTES} minutos.
            </p>
            <Link
              href="/mi-ranking"
              className="mt-4 font-mono text-xs uppercase tracking-widest text-podium-gold underline"
            >
              Ver mi ranking →
            </Link>
          </div>
        )}

        {phase === "tap-out-result" && tapOutResult && (
          <div className="flex flex-col items-center text-center gap-4">
            {tapOutResult.valid ? (
              <>
                <p className="font-display text-2xl uppercase text-podium-mint">
                  Sesión validada
                </p>
                <p className="text-podium-asphalt/70">
                  {tapOutResult.minutes} minutos de entrenamiento
                </p>
                <p className="font-display text-6xl tabular text-podium-gold">
                  +{tapOutResult.xp} XP
                </p>
                {tapOutResult.rankPosition && (
                  <p className="text-podium-asphalt/60 text-sm">
                    Ahora estás en el puesto{" "}
                    <span className="text-podium-asphalt font-semibold">
                      #{tapOutResult.rankPosition}
                    </span>{" "}
                    del gimnasio
                  </p>
                )}

                {/* Selector rápido opcional — 3 segundos, sin bloquear nada */}
                {!muscleGroupSaved ? (
                  <div className="w-full mt-4 pt-4 border-t border-podium-asphalt/10">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3">
                      ¿Qué has entrenado hoy? (opcional)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {MUSCLE_GROUPS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleMuscleGroupPick(g.id)}
                          className="flex items-center justify-center gap-2 rounded-md border border-podium-asphalt/15 py-3 hover:border-podium-gold hover:bg-podium-gold/10 transition-colors"
                        >
                          <span>{g.emoji}</span>
                          <span className="font-mono text-xs uppercase">{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-podium-mint">✓ Registrado, gracias</p>
                )}

                <Link
                  href="/mi-ranking"
                  className="mt-4 w-full bg-podium-asphalt text-podium-chalk hover:bg-podium-asphalt/90 transition-colors rounded-md py-4 font-display text-xl uppercase tracking-wide"
                >
                  Ver mis premios y ranking
                </Link>
              </>
            ) : (
              <>
                <p className="font-display text-2xl uppercase text-podium-danger">
                  Sesión demasiado corta
                </p>
                <p className="text-podium-asphalt/70 max-w-xs">
                  {tapOutResult.minutes} minutos — se necesitan al menos{" "}
                  {MIN_MINUTES} minutos para que cuente. No se ha otorgado XP
                  esta vez.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={null}>
      <CheckinContent />
    </Suspense>
  );
}
