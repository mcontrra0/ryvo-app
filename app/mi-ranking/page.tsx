"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GYM_NAME, GYM_ID } from "@/lib/mockData";
import { Reward, CashbackRule, DEFAULT_CASHBACK_RULE, Member } from "@/lib/types";
import { getRewardsForGym } from "@/lib/rewardsStore";
import { getCashbackRuleForGym } from "@/lib/cashbackStore";
import { getMinSessionsPerWeek } from "@/lib/streakStore";
import {
  getDeviceMember,
  getRanking,
  getPendingClaim,
  claimForgottenCheckout,
} from "@/lib/memberStore";
import Logo from "@/components/Logo";

function MiRankingInner() {
  const [me, setMe] = useState<Member | null | undefined>(undefined);
  const [ranking, setRanking] = useState<Member[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [cashback, setCashback] = useState<CashbackRule>(DEFAULT_CASHBACK_RULE);
  const [minSessions, setMinSessions] = useState<number>(2);
  const [claimEligible, setClaimEligible] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const m = await getDeviceMember();
      setMe(m);
      setRanking(await getRanking(GYM_ID));
      setRewards(await getRewardsForGym(GYM_ID));
      setCashback(await getCashbackRuleForGym(GYM_ID));
      setMinSessions(await getMinSessionsPerWeek(GYM_ID));
      if (m) setClaimEligible((await getPendingClaim(m.id)).eligible);
    })();
  }, []);

  async function handleClaim() {
    if (!me) return;
    const result = await claimForgottenCheckout(me.id);
    if (result.success) {
      setClaimMsg(`+${result.xp} XP reclamados. Recuerda fichar salida la próxima vez 😉`);
      setClaimEligible(false);
      setMe(await getDeviceMember());
      setRanking(await getRanking(GYM_ID));
    }
  }

  if (me === undefined) return null;

  if (me === null) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-podium-chalk text-podium-asphalt px-6 py-16 text-center">
        <Logo size="md" className="justify-center mb-8" />
        <p className="font-display text-3xl uppercase mb-3">Aún no te has registrado</p>
        <p className="text-podium-asphalt/60 max-w-xs mb-8">
          Toca el NFC de la entrada de tu gimnasio para crear tu perfil y
          empezar a sumar XP.
        </p>
        <Link
          href="/checkin?gym=box-rinconada"
          className="font-mono text-xs uppercase tracking-widest text-podium-gold underline"
        >
          Simular mi primer fichaje →
        </Link>
      </main>
    );
  }

  const myPosition = ranking.findIndex((m) => m.id === me.id) + 1;
  const nextReward = rewards.find((r) => r.xpRequired > me.xpTotal);
  const prevThreshold =
    [...rewards].reverse().find((r) => r.xpRequired <= me.xpTotal)?.xpRequired ?? 0;
  const progress = nextReward
    ? Math.round(
        ((me.xpTotal - prevThreshold) / (nextReward.xpRequired - prevThreshold)) * 100
      )
    : 100;

  const cashbackDays = (me.sessionDaysThisMonth ?? []).length;
  const cashbackAchieved = cashbackDays >= cashback.minDaysPerMonth;
  const cashbackProgress = Math.min(
    100,
    Math.round((cashbackDays / cashback.minDaysPerMonth) * 100)
  );

  const topSlice = ranking.slice(0, 10);
  const meInTop = topSlice.some((m) => m.id === me.id);

  return (
    <main className="flex-1 bg-podium-chalk text-podium-asphalt px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <Logo size="sm" className="mb-3" />
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-1">
          {GYM_NAME}
        </p>
        <h1 className="font-display text-4xl uppercase tracking-tight mb-6">Tu progreso</h1>

        {/* Banner "olvidé fichar" — solo aparece si hay algo que reclamar */}
        {claimEligible && (
          <div className="rounded-lg border border-podium-gold/40 bg-podium-gold/10 p-4 mb-6">
            <p className="font-display text-lg uppercase mb-1">¿Se te olvidó fichar salida?</p>
            <p className="text-podium-asphalt/70 text-sm mb-3">
              Detectamos una sesión sin cerrar. Puedes reclamar tus puntos una
              vez por semana.
            </p>
            <button
              onClick={handleClaim}
              className="w-full bg-podium-gold text-podium-asphalt rounded-md py-3 font-display uppercase tracking-wide"
            >
              Reclamar +100 XP
            </button>
          </div>
        )}
        {claimMsg && (
          <p className="font-mono text-xs text-podium-mint mb-6 text-center">{claimMsg}</p>
        )}

        {/* Tarjeta de perfil */}
        <div className="rounded-lg border border-podium-asphalt/15 bg-podium-asphalt/5 p-6 mb-6 text-center">
          <p className="font-display text-2xl uppercase">{me.fullName}</p>
          <p className="font-mono text-xs text-podium-asphalt/50 mb-4">{me.memberCode}</p>

          <div className="flex justify-center gap-8 mb-5">
            <div>
              <p className="font-display text-3xl tabular text-podium-gold">#{myPosition || "–"}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50">
                Puesto
              </p>
            </div>
            <div>
              <p className="font-display text-3xl tabular">{me.xpTotal}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50">
                XP total
              </p>
            </div>
            <div>
              <p className="font-display text-3xl tabular">{me.racha}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/50">
                Racha (semanas)
              </p>
            </div>
          </div>

          <p className="font-mono text-[11px] text-podium-asphalt/50 mb-5">
            Esta semana: {me.currentWeekSessions}/{minSessions} sesiones
            {me.currentWeekSessions >= minSessions ? " ✓ racha asegurada" : ""}
          </p>

          {nextReward && (
            <div>
              <div className="flex justify-between font-mono text-[10px] text-podium-asphalt/50 mb-1">
                <span>Próximo: {nextReward.title}</span>
                <span>
                  {me.xpTotal} / {nextReward.xpRequired} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-podium-asphalt/10 overflow-hidden">
                <div
                  className="h-full bg-podium-gold rounded-full transition-all"
                  style={{ width: `${Math.max(4, progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cashback — alternativa para quien prefiere ahorro directo a premios */}
        {cashback.enabled && (
        <div className="rounded-lg border border-podium-mint/30 bg-podium-mint/5 p-5 mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-podium-mint mb-2">
            Ahorro en tu cuota
          </p>
          {cashbackAchieved ? (
            <p className="text-sm">
              🎉 Has venido {cashbackDays} días este mes — te descontamos{" "}
              <span className="font-semibold">{cashback.discountEuros}€</span> en la
              próxima cuota.
            </p>
          ) : (
            <>
              <p className="text-sm text-podium-asphalt/70 mb-2">
                Ven {cashback.minDaysPerMonth} días este mes y te
                descontamos {cashback.discountEuros}€ en la cuota del mes
                que viene.
              </p>
              <div className="flex justify-between font-mono text-[10px] text-podium-asphalt/50 mb-1">
                <span>Este mes</span>
                <span>
                  {cashbackDays} / {cashback.minDaysPerMonth} días
                </span>
              </div>
              <div className="h-2 rounded-full bg-podium-asphalt/10 overflow-hidden">
                <div
                  className="h-full bg-podium-mint rounded-full transition-all"
                  style={{ width: `${Math.max(4, cashbackProgress)}%` }}
                />
              </div>
            </>
          )}
        </div>
        )}

        {/* Escalera de premios */}
        <h2 className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-3">
          Próximos premios
        </h2>
        <div className="flex flex-col gap-2 mb-8">
          {rewards.length === 0 && (
            <p className="font-mono text-xs text-podium-asphalt/40 text-center py-6 border border-dashed border-podium-asphalt/15 rounded-md">
              Tu gimnasio todavía no ha configurado premios.
            </p>
          )}
          {rewards.map((r) => {
            const unlocked = me.xpTotal >= r.xpRequired;
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                  unlocked
                    ? "border-podium-mint/40 bg-podium-mint/10"
                    : "border-podium-asphalt/15 bg-podium-asphalt/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{unlocked ? "🏆" : "🔒"}</span>
                  <div>
                    <p className={unlocked ? "font-medium" : "text-podium-asphalt/70"}>{r.title}</p>
                    <p className="font-mono text-[10px] text-podium-asphalt/50">
                      {r.announcement ? `${r.announcement} · ` : ""}
                      {r.xpRequired} XP
                    </p>
                  </div>
                </div>
                {unlocked && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-podium-mint">
                    Conseguido
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Ranking del gimnasio */}
        <h2 className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-3">
          Ranking de {GYM_NAME}
        </h2>
        <div className="flex flex-col gap-1.5">
          {topSlice.map((m, i) => (
            <RankRow key={m.id} position={i + 1} member={m} isMe={m.id === me.id} />
          ))}
          {!meInTop && (
            <>
              <p className="text-center font-mono text-podium-asphalt/30 py-1">···</p>
              <RankRow position={myPosition} member={me} isMe />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function RankRow({ position, member, isMe }: { position: number; member: Member; isMe: boolean }) {
  const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : null;
  return (
    <div
      className={`flex items-center justify-between rounded-md px-4 py-2.5 ${
        isMe ? "bg-podium-gold/15 border border-podium-gold/40" : "bg-podium-asphalt/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm w-6 text-podium-asphalt/50 tabular">{medal ?? position}</span>
        <span className={isMe ? "font-semibold" : ""}>
          {member.fullName}
          {isMe && <span className="text-podium-gold"> (tú)</span>}
        </span>
      </div>
      <span className="font-mono text-sm tabular text-podium-asphalt/60">{member.xpTotal} XP</span>
    </div>
  );
}

export default function MiRankingPage() {
  return <MiRankingInner />;
}
