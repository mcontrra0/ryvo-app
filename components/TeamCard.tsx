"use client";

import { useEffect, useState } from "react";
import { GYM_ID } from "@/lib/mockData";
import {
  Team,
  TeamRankingEntry,
  getTeamForMember,
  createTeam,
  joinTeamByCode,
  leaveTeam,
  getTeamRanking,
} from "@/lib/teamStore";
import { IconTeam, IconCheck, IconLock, IconBadge } from "@/components/icons";

export default function TeamCard({ memberId }: { memberId: string }) {
  const [team, setTeam] = useState<Team | null | undefined>(undefined);
  const [ranking, setRanking] = useState<TeamRankingEntry[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function refresh() {
    setTeam(await getTeamForMember(memberId));
    setRanking(await getTeamRanking(GYM_ID));
  }

  useEffect(() => {
    refresh();
    const urlCode = new URLSearchParams(window.location.search).get("join");
    if (urlCode) setCode(urlCode.toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  async function handleCreate() {
    if (!name.trim()) return;
    setBusy(true);
    setMsg(null);
    const result = await createTeam(GYM_ID, memberId, name);
    setBusy(false);
    if (result.success) {
      setName("");
      refresh();
    } else {
      setMsg(result.error ?? "No se pudo crear");
    }
  }

  async function handleJoin() {
    if (code.trim().length < 4) return;
    setBusy(true);
    setMsg(null);
    const result = await joinTeamByCode(GYM_ID, memberId, code);
    setBusy(false);
    if (result.success) {
      setCode("");
      refresh();
    } else {
      setMsg(result.error ?? "No se pudo unir");
    }
  }

  async function handleLeave() {
    setBusy(true);
    await leaveTeam(memberId);
    setBusy(false);
    refresh();
  }

  function handleCopyInvite() {
    if (!team) return;
    const url = `${window.location.origin}/mi-ranking?join=${team.inviteCode}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (team === undefined) return null;

  const metCount = team?.members.filter((m) => m.goalMet).length ?? 0;

  return (
    <div>
      <p className="text-podium-asphalt/60 mb-6 max-w-md">
        Un grupo cerrado de 2 a 4 personas. Cada uno mantiene su propio XP
        y objetivo — el equipo solo hace visible quién va al día esta
        semana, para que os deis un empujón entre vosotros.
      </p>

      {!team ? (
        <>
          <div className="rounded-lg border border-podium-track/30 bg-podium-track/5 p-5 mb-4 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
            <p className="font-mono text-[11px] uppercase tracking-widest text-podium-track-dark mb-3 flex items-center gap-2">
              <IconBadge icon={IconTeam} tone="track" size="sm" />
              Crear equipo
            </p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre (ej. Los de las 7)"
                className="flex-1 bg-white border border-podium-asphalt/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-podium-track-dark"
              />
              <button
                onClick={handleCreate}
                disabled={busy || !name.trim()}
                className="shrink-0 bg-podium-track hover:bg-podium-track-dark disabled:opacity-30 transition-colors rounded-md px-4 py-2 font-mono text-xs uppercase tracking-widest text-podium-asphalt"
              >
                Crear
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-podium-asphalt/12 bg-white p-5 mb-4 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
            <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3">
              ¿Tienes un código?
            </p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="flex-1 bg-transparent border border-podium-asphalt/20 rounded-md px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:border-podium-track-dark"
              />
              <button
                onClick={handleJoin}
                disabled={busy || code.trim().length < 4}
                className="shrink-0 bg-podium-asphalt text-podium-chalk disabled:opacity-30 transition-colors rounded-md px-4 py-2 font-mono text-xs uppercase tracking-widest"
              >
                Unirme
              </button>
            </div>
          </div>

          {msg && <p className="font-mono text-xs text-podium-danger mb-4">{msg}</p>}
        </>
      ) : (
        <div className="rounded-lg border border-podium-track/30 bg-podium-track/5 p-5 mb-6 shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-podium-track-dark flex items-center gap-2">
              <IconBadge icon={IconTeam} tone="track" size="sm" />
              {team.name}
            </p>
            <span className="font-mono text-[10px] text-podium-asphalt/50">
              {metCount}/{team.members.length} al día
            </span>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2"
              >
                <span className="text-sm">{m.fullName}</span>
                <span className="flex items-center gap-1.5 font-mono text-xs text-podium-asphalt/60">
                  {m.currentWeekSessions}/{m.weeklyGoalDays}
                  {m.goalMet ? (
                    <IconCheck className="w-4 h-4 text-podium-mint" />
                  ) : (
                    <IconLock className="w-3.5 h-3.5 text-podium-asphalt/25" />
                  )}
                </span>
              </div>
            ))}
          </div>

          {team.members.length < 4 && (
            <button
              onClick={handleCopyInvite}
              className="w-full font-mono text-xs uppercase tracking-widest bg-podium-asphalt text-podium-chalk rounded-md py-2.5 mb-3"
            >
              {copied ? "✓ Enlace copiado" : `Invitar — código ${team.inviteCode}`}
            </button>
          )}

          <button
            onClick={handleLeave}
            disabled={busy}
            className="w-full font-mono text-[11px] uppercase tracking-widest text-podium-danger hover:underline"
          >
            Salir del equipo
          </button>
        </div>
      )}

      <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3">
        Ranking de equipos
      </p>
      {ranking.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 border border-dashed border-podium-asphalt/15 rounded-md">
          <IconTeam className="w-6 h-6 text-podium-asphalt/25" />
          <p className="font-mono text-xs text-podium-asphalt/40 text-center">
            Todavía no hay equipos en tu gimnasio. Sé el primero en crear uno.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {ranking.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center justify-between rounded-md px-4 py-2.5 ${
                team?.id === t.id
                  ? "bg-podium-track/10 border border-podium-track/40"
                  : "bg-podium-asphalt/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm w-6 text-podium-asphalt/50 tabular text-center">
                  {i + 1}
                </span>
                <div>
                  <p className={team?.id === t.id ? "font-semibold" : ""}>{t.name}</p>
                  <p className="font-mono text-[10px] text-podium-asphalt/40">
                    {t.memberCount} miembro(s)
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm tabular text-podium-asphalt/60">
                {t.totalXp} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
