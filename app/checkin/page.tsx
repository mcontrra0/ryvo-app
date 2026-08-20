"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GYM_NAME } from "@/lib/mockData";
import { GYM_COORDS, GPS_WARN_METERS, Member } from "@/lib/types";
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
  hasValidSessionToday,
  MIN_MINUTES,
} from "@/lib/memberStore";
import RegisterForm from "@/components/RegisterForm";
import Logo from "@/components/Logo";
import { getOffpeakRuleForGym, isWithinOffpeak, OffpeakRule } from "@/lib/offpeakStore";
import { IconCheck, IconSun } from "@/components/icons";

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

type Phase = "loading" | "register" | "already-today" | "tap-in-result" | "tap-out-result";

interface TapOutResult {
  minutes: number;
  valid: boolean;
  xp: number;
  offpeakBonus: number;
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
  const [offpeak, setOffpeak] = useState<OffpeakRule | null>(null);

  async function processGeneralTap(member: Member) {
    await checkAndHandleAbandonedCheckin(member.id); // por si la sesión abierta era de hace horas

    const open = await getOpenCheckin(member.id);
    const offpeakRule = offpeak ?? (await getOffpeakRuleForGym(gymSlug));
    if (!offpeak) setOffpeak(offpeakRule);

    if (!open) {
      // Ya has fichado (y validado) hoy — no se abre una sesión nueva
      if (hasValidSessionToday(member)) {
        setMemberName(member.fullName);
        setPhase("already-today");
        return;
      }

      // TAP 1 — entrada
      await startCheckin(gymSlug, member.id);
      checkGpsSoftly(member.id);
      setMemberName(member.fullName);
      setPhase("tap-in-result");
      return;
    }

    // TAP 2 — salida
    const minutes = Math.floor((Date.now() - new Date(open.startedAt).getTime()) / 60000);
    const valid = minutes >= MIN_MINUTES;
    const baseXp = valid ? 100 + Math.min(minutes - MIN_MINUTES, 30) : 0;
    const startHour = new Date(open.startedAt).getHours();
    const offpeakBonus = valid && isWithinOffpeak(startHour, offpeakRule) ? offpeakRule.bonusXp : 0;
    const xp = baseXp + offpeakBonus;

    await closeCheckin(open.id, minutes, valid, xp);
    if (valid) await awardXp(open.memberId, xp);

    setTapOutResult({
      minutes,
      valid,
      xp,
      offpeakBonus,
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
      await processGeneralTap(existing);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegisterComplete(data: { fullName: string; phone: string; pin: string }) {
    const member = await registerMember(gymSlug, data);
    if (!member) return; // TODO: mostrar error si Supabase no está configurado/falla
    await processGeneralTap(member);
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

        {phase === "already-today" && (
          <div className="flex flex-col items-center text-center gap-4">
            <IconCheck className="w-12 h-12 text-podium-mint" />
            <p className="font-display text-2xl uppercase tracking-tight">
              Ya has fichado hoy, {memberName.split(" ")[0]}
            </p>
            <p className="text-podium-asphalt/60 text-sm max-w-xs">
              Solo se registra una sesión válida al día. ¡Vuelve mañana a
              seguir sumando XP!
            </p>
            <Link
              href="/mi-ranking"
              className="mt-4 w-full bg-podium-asphalt text-podium-chalk hover:bg-podium-asphalt/90 transition-colors rounded-md py-4 font-display text-xl uppercase tracking-wide"
            >
              Ver mi ranking
            </Link>
          </div>
        )}

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
            {offpeak && isWithinOffpeak(new Date().getHours(), offpeak) && (
              <p className="font-mono text-xs text-podium-mint bg-podium-mint/10 border border-podium-mint/30 rounded-md px-3 py-2 flex items-center justify-center gap-2">
                <IconSun className="w-4 h-4 shrink-0" />
                Estás en horas valle — +{offpeak.bonusXp} XP extra al validar
              </p>
            )}
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
                {tapOutResult.offpeakBonus > 0 && (
                  <p className="font-mono text-xs text-podium-mint flex items-center gap-1.5">
                    <IconSun className="w-3.5 h-3.5 shrink-0" />
                    Incluye +{tapOutResult.offpeakBonus} XP por hora valle
                  </p>
                )}
                {tapOutResult.rankPosition && (
                  <p className="text-podium-asphalt/60 text-sm">
                    Ahora estás en el puesto{" "}
                    <span className="text-podium-asphalt font-semibold">
                      #{tapOutResult.rankPosition}
                    </span>{" "}
                    del gimnasio
                  </p>
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
