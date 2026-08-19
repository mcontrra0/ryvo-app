import Image from "next/image";

const SIZES = {
  sm: { icon: 20, textWidth: 70 },
  md: { icon: 28, textWidth: 96 },
  lg: { icon: 40, textWidth: 140 },
} as const;

// Logo de Ryvo — icono + wordmark reales (public/brand/), ya no
// dibujados a mano. El wordmark tiene dos variantes de color porque el
// archivo original es un contorno claro pensado para fondo oscuro:
// "dark" (texto oscuro) para las pantallas de fondo claro, que son casi
// todas ahora; "light" (el original) solo para el hero oscuro de la
// landing.
export default function Logo({
  size = "md",
  tone = "light",
  className = "",
}: {
  size?: keyof typeof SIZES;
  tone?: "light" | "dark"; // "dark" = fondo oscuro detrás del logo (ej. el hero de la landing)
  className?: string;
}) {
  const s = SIZES[size];
  const textSrc =
    tone === "dark" ? "/brand/ryvo-text-light.png" : "/brand/ryvo-text-dark.png";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/ryvo-logo.png"
        alt=""
        width={s.icon}
        height={s.icon}
        priority
      />
      <Image
        src={textSrc}
        alt="Ryvo"
        width={s.textWidth}
        height={Math.round((s.textWidth * 72) / 380)}
        priority
      />
    </div>
  );
}
