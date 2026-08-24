// Iconos de navegación propios, monocromáticos (heredan el color con
// currentColor) — en vez de emoji genéricos que podrían ser de
// cualquier app. Un par de ellos conectan a propósito con la
// identidad de marca: Ranking usa bloques de podio, y Actividad usa
// un trazo en zigzag ascendente que recuerda al icono del logo.

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconOverview({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="3.5" y="12" width="4.5" height="8.5" rx="1.2" />
      <rect x="9.75" y="6.5" width="4.5" height="14" rx="1.2" />
      <rect x="16" y="9.5" width="4.5" height="11" rx="1.2" />
    </Svg>
  );
}

export function IconStreak({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12.8 2c1.3 3.4-1.7 4.9-3.1 7.4C8.2 11.8 8 13.6 9 15c-.7-2 .4-3.2 1.6-4.3-.2 1.7.7 2.6 2 3.5.9.6 1.6 1.3 1.6 2.5 0 1.9-1.7 3.3-3.9 3.3-3 0-5.6-2.3-5.6-6.1 0-5.7 4.6-6.9 8.1-11.9z" />
    </Svg>
  );
}

export function IconTrophy({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M7 3h10v5a5 5 0 01-10 0V3z" />
      <path d="M7 4H4.5A2.5 2.5 0 007 8.3V6.2A2.8 2.8 0 017 4z" />
      <path d="M17 4h2.5A2.5 2.5 0 0117 8.3V6.2A2.8 2.8 0 0017 4z" />
      <rect x="11" y="13" width="2" height="4.5" />
      <rect x="8" y="18.5" width="8" height="2" rx="0.6" />
    </Svg>
  );
}

export function IconPodium({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="3" y="13.5" width="5.2" height="7.5" rx="1" />
      <rect x="9.4" y="7.5" width="5.2" height="13.5" rx="1" />
      <rect x="15.8" y="10.8" width="5.2" height="10.2" rx="1" />
    </Svg>
  );
}

export function IconShield({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 2.5l7.5 3v5.3c0 5-3.2 8.9-7.5 10.7-4.3-1.8-7.5-5.7-7.5-10.7V5.5l7.5-3z" />
    </Svg>
  );
}

export function IconTrend({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M3 17l5.5-6.5L12.5 14 21 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="21" cy="4" r="2" />
    </Svg>
  );
}

export function IconUser({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 20.5c0-4.7 3.8-7.5 7.5-7.5s7.5 2.8 7.5 7.5a1 1 0 01-1 1H5.5a1 1 0 01-1-1z" />
    </Svg>
  );
}

export function IconTap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="9" cy="15" r="2.6" fill="currentColor" stroke="none" />
      <path d="M14 10.5a5 5 0 010 9" />
      <path d="M17.3 7.2a9.5 9.5 0 010 15.6" />
    </svg>
  );
}

export function IconTeam({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="8.5" cy="7.5" r="3" />
      <circle cx="16.5" cy="8.5" r="2.4" opacity="0.7" />
      <path d="M2.5 20c0-3.7 2.8-5.8 6-5.8s6 2.1 6 5.8a1 1 0 01-1 1h-10a1 1 0 01-1-1z" />
      <path d="M14 14.5c.4-.1.7-.1 1.1-.1 2.4 0 4.9 1.8 4.9 5a1 1 0 01-1 1h-2.6" opacity="0.7" />
    </Svg>
  );
}

export function IconFreeze({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5.5" y1="7" x2="18.5" y2="17" />
      <line x1="18.5" y1="7" x2="5.5" y2="17" />
      <path d="M12 3l-2 1.6M12 3l2 1.6M12 21l-2-1.6M12 21l2-1.6" />
    </svg>
  );
}

export function IconLock({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2.2" />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <path d="M7 12.3l3.2 3.2L17.2 8.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <g strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
        <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
        <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
        <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
      </g>
    </svg>
  );
}

export function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="11.1" y="9" width="1.8" height="5.5" rx="0.9" />
      <circle cx="12" cy="17" r="1.1" />
    </svg>
  );
}

export function IconPercent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="7" cy="7" r="2.3" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17" r="2.3" fill="currentColor" stroke="none" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

// Insignia circular con fondo de color alrededor del icono — el
// detalle que hace que una cabecera de sección se sienta diseñada en
// vez de un emoji suelto.
const BADGE_TONES = {
  track: "bg-podium-track/15 text-podium-track-dark",
  gold: "bg-podium-gold/15 text-podium-gold",
  mint: "bg-podium-mint/15 text-podium-mint",
  danger: "bg-podium-danger/15 text-podium-danger",
} as const;

export function IconBadge({
  icon: Icon,
  tone = "track",
  size = "md",
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  tone?: keyof typeof BADGE_TONES;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const iconDims = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className={`${dims} rounded-full flex items-center justify-center shrink-0 ${BADGE_TONES[tone]}`}>
      <Icon className={iconDims} />
    </div>
  );
}
