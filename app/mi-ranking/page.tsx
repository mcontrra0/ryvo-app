"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GYM_NAME, GYM_ID } from "@/lib/mockData";
import { Reward, Member } from "@/lib/types";
import { getRewardsForGym } from "@/lib/rewardsStore";
import { getOffpeakRuleForGym, DEFAULT_OFFPEAK_RULE, OffpeakRule } from "@/lib/offpeakStore";
import {
  getDeviceMember,
  getRanking,
  getPendingClaim,
  claimForgottenCheckout,
  loginWithPhonePin,
  clearDeviceMemberId,
} from "@/lib/memberStore";
import Logo from "@/components/Logo";
import StreakCard from "@/components/StreakCard";
import { IconOverview, IconStreak, IconTrophy, IconPodium, IconLock, IconSun, IconBadge } from "@/components/icons";

type Tab = "overview" | "racha" | "premios" | "ranking";

const TABS: { id: Tab; label: string; Icon: typeof IconOverview }[] = [
  { id: "overview", label: "Resumen", Icon: IconOverview },
  { id: "racha", label: "Racha", Icon: IconStreak },
  { id: "premios", label: "Premios", Icon: IconTrophy },
  { id: "ranking", label: "Ranking", Icon: IconPodium },
];

function DeviceLoginForm({ onSuccess }: { onSuccess: (m: Member) => void }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(false);
    const member = await loginWithPhonePin(GYM_ID, phone, pin);
    setLoading(false);
    if (!member) {
      setError(true);
      return;
    }
    onSuccess(member);
  }

  return (
    <div className="w-full max-w-xs mt-8 pt-8 border-t border-podium-asphalt/10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3">
        ¿Ya tienes cuenta? Accede desde aquí
      </p>
      <div className="flex flex-col gap-2">
        <input
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(false);
          }}
          placeholder="Teléfono"
          inputMode="tel"
          className="bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-2.5 text-sm placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark"
        />
        <input
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError(false);
          }}
          placeholder="PIN de 4 dígitos"
          inputMode="numeric"
          type="password"
          className="bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-2.5 text-sm tracking-[0.4em] placeholder:tracking-normal placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark"
        />
        {error && (
          <p className="font-mono text-xs text-podium-danger">
            Teléfono o PIN incorrectos.
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !phone || pin.length !== 4}
          className="bg-podium-asphalt text-podium-chalk hover:bg-podium-asphalt/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md py-2.5 font-mono text-xs uppercase tracking-widest"
        >
          {loading ? "Comprobando…" : "Acceder"}
        </button>
      </div>
    </div>
  );
}

function MiRankingInner() {
  const [tab, setTab] = useState<Tab>("overview");
  const [me, setMe] = useState<Member | null | undefined>(undefined);
  const [ranking, setRanking] = useState<Member[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [offpeak, setOffpeak] = useState<OffpeakRule>(DEFAULT_OFFPEAK_RULE);
  const [claimEligible, setClaimEligible] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const m = await getDeviceMember();
      setMe(m);
      setRanking(await getRanking(GYM_ID));
      setRewards(await getRewardsForGym(GYM_ID));
      setOffpeak(await getOffpeakRuleForGym(GYM_ID));
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

  function handleLogout() {
    clearDeviceMemberId();
    setMe(null);
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

        <DeviceLoginForm
          onSuccess={async (member) => {
            setMe(member);
            setRanking(await getRanking(GYM_ID));
            setClaimEligible((await getPendingClaim(member.id)).eligible);
          }}
        />
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

  const topSlice = ranking.slice(0, 10);
  const meInTop = topSlice.some((m) => m.id === me.id);

  return (
    <main className="flex-1 bg-podium-chalk text-podium-asphalt px-6 pt-10 pb-24 sm:pb-10">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex items-start justify-between mb-1">
          <div>
            <Logo size="sm" className="mb-3" />
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-1">
              {GYM_NAME}
            </p>
            <h1 className="font-display text-4xl uppercase tracking-tight mb-6">Tu progreso</h1>
          </div>
          <button
            onClick={handleLogout}
            className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 hover:text-podium-asphalt underline shrink-0 mt-2"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Pestañas — arriba en pantallas grandes (sm+), abajo fijas en móvil */}
        <div className="hidden sm:flex gap-2 mb-8 border-b border-podium-asphalt/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`font-mono text-xs uppercase tracking-widest px-1 pb-3 -mb-px border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === t.id
                  ? "border-podium-track-dark text-podium-asphalt"
                  : "border-transparent text-podium-asphalt/40 hover:text-podium-asphalt/70"
              }`}
            >
              <t.Icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
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
              </div>

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

            {/* Horas valle — para que el socio sepa cuándo aprovechar el bonus */}
            {offpeak.enabled && (
              <div className="rounded-lg border border-podium-gold/30 bg-podium-gold/5 p-5 mb-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-podium-gold mb-2 flex items-center gap-2">
                  <IconBadge icon={IconSun} tone="gold" size="sm" />
                  Horas valle
                </p>
                <p className="text-sm text-podium-asphalt/70">
                  Entrena entre las <span className="font-semibold text-podium-asphalt">{offpeak.startHour}h</span> y las{" "}
                  <span className="font-semibold text-podium-asphalt">{offpeak.endHour}h</span> y ganas{" "}
                  <span className="font-semibold text-podium-asphalt">+{offpeak.bonusXp} XP extra</span> por sesión —
                  perfecto si tienes horario flexible.
                </p>
              </div>
            )}
          </>
        )}

        {tab === "racha" && <StreakCard member={me} onMemberUpdate={setMe} />}

        {tab === "premios" && (
          <div className="flex flex-col gap-2">
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
                    <span className="text-lg">
                      {unlocked ? (
                        <IconTrophy className="w-5 h-5 text-podium-mint" />
                      ) : (
                        <IconLock className="w-5 h-5 text-podium-asphalt/30" />
                      )}
                    </span>
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
        )}

        {tab === "ranking" && (
          <div className="flex flex-col gap-1.5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-2">
              Ranking de {GYM_NAME}
            </h2>
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
        )}
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
  );
}

function RankRow({ position, member, isMe }: { position: number; member: Member; isMe: boolean }) {
  const medalColor =
    position === 1
      ? "bg-podium-gold text-podium-asphalt"
      : position === 2
      ? "bg-podium-silver text-podium-asphalt"
      : position === 3
      ? "bg-podium-bronze text-podium-chalk"
      : null;
  return (
    <div
      className={`flex items-center justify-between rounded-md px-4 py-2.5 ${
        isMe ? "bg-podium-gold/15 border border-podium-gold/40" : "bg-podium-asphalt/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {medalColor ? (
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${medalColor}`}>
            {position}
          </span>
        ) : (
          <span className="font-mono text-sm w-6 text-podium-asphalt/50 tabular text-center">{position}</span>
        )}
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
