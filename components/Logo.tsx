const SIZES = {
  sm: { icon: 16, text: "text-lg", gap: "gap-1.5" },
  md: { icon: 22, text: "text-3xl", gap: "gap-2" },
  lg: { icon: 32, text: "text-5xl", gap: "gap-2.5" },
} as const;

// Logo de Ryvo — icono (chevron ascendente) + wordmark en Bebas Neue,
// una fuente condensada propia del logo, distinta de la que usa el
// resto de la interfaz (font-display) para que la marca destaque como
// un elemento propio y no se confunda con un título más de pantalla.
//
// El wrapper es "flex" (no "inline-flex") a propósito: así, cuando el
// que lo usa le pasa "justify-center", el centrado funciona de verdad
// (un inline-flex se comporta como texto en línea y ignora su propio
// justify-content al posicionarse dentro del padre).
export default function Logo({
  size = "md",
  tone = "light",
  className = "",
}: {
  size?: keyof typeof SIZES;
  tone?: "light" | "dark"; // "dark" = se usa sobre un fondo oscuro (ej. el hero de la landing)
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polyline
          points="6,23 16,7 26,23"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={tone === "dark" ? "text-podium-track" : "text-podium-track-dark"}
        />
      </svg>
      <span
        className={`font-logo uppercase tracking-wide leading-none ${s.text}`}
        style={{ fontFamily: "var(--font-logo)" }}
      >
        Ryvo
      </span>
    </div>
  );
}
