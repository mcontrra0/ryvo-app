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
      <path d="M12.5 2.2c1.1 3.1-1.9 4.4-2.6 6.9-.4 1.4.2 2.4 1.1 2.7-.5-1.3.1-2.1.7-2.9.2 1 1 1.4 1 2.5 0 1.3-1 2.3-2.5 2.3-1.9 0-3.7-1.5-3.7-4 0-3.9 3.1-4.7 6-7.5z" />
      <path d="M9.2 15.6c.6 1.6 2 2.5 3.6 2.5 2.2 0 4-1.7 4-4.1 0-1.6-.7-2.5-1.3-3.4.3 1.9-.5 3-1.6 3.6.3-1.6-.3-2.4-1.1-3.1-.1 1.7-1.2 2.4-2.3 3.2-.9.6-1.5 1.1-1.3 1.3z" />
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
