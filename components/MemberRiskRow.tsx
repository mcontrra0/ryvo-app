import { Member, RISK_META, computeRisk } from "@/lib/types";

function formatUltimaSesion(iso: string | null): string {
  if (!iso) return "Sin sesiones";
  const dias = Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (dias < 1) return "Hoy";
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

export default function MemberRiskRow({ member }: { member: Member }) {
  const risk = computeRisk(member);
  const meta = RISK_META[risk];

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 ${meta.bg}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg leading-none">{meta.emoji}</span>
        <div className="min-w-0">
          <p className="font-medium truncate">{member.fullName}</p>
          <p className="font-mono text-xs text-podium-asphalt/50">
            {member.memberCode} · {formatUltimaSesion(member.ultimaSesion)}
            {member.racha > 0 ? ` · racha de ${member.racha} semanas` : ""}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-mono text-xs font-semibold uppercase tracking-wide ${meta.color}`}>
          {meta.label}
        </p>
        <p className="font-mono text-xs text-podium-asphalt/50">
          {member.sesionesUltimos14Dias} sesiones / 14 días
        </p>
      </div>
    </div>
  );
}
