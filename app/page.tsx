import Link from "next/link";
import Logo from "@/components/Logo";
import { IconTap, IconShield, IconTrophy, IconSun, IconStreak, IconBadge } from "@/components/icons";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-podium-chalk text-podium-asphalt">
      {/* Banner de fase piloto — refuerza el mensaje de "precio fundador" de más abajo */}
      <div className="bg-podium-track text-podium-asphalt text-center py-3 font-mono text-sm uppercase tracking-widest">
        🚀 En fase piloto en Sevilla — precio fundador para los primeros gimnasios
      </div>

      {/* HERO */}
      <section className="relative bg-podium-asphalt text-podium-chalk px-6 pt-14 pb-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(143,212,0,0.14), transparent)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <Logo size="lg" tone="dark" className="justify-center mb-10" />
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-chalk/50 mb-5">
            Para gimnasios y boxes independientes
          </p>
          <h1 className="font-display text-6xl sm:text-7xl uppercase tracking-tight leading-[0.95] mb-6">
            Retén a tus socios
            <br />
            <span className="text-podium-track">antes</span> de que se vayan
          </h1>
          <p className="text-podium-chalk/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Ryvo avisa a tu equipo qué socios están a punto de dar de baja
            — antes de que pase — y convierte cada entrenamiento en un
            juego con premios reales, sin cambiar el software que ya usas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/login"
              className="bg-podium-track hover:bg-podium-track-dark hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(143,212,0,0.25)] transition-all rounded-md px-8 py-4 font-display text-xl uppercase tracking-wide text-podium-asphalt"
            >
              Ver la demo
            </Link>
            <a
              href="mailto:hola@ryvo.app"
              className="border border-podium-chalk/30 hover:border-podium-chalk/60 hover:-translate-y-0.5 transition-all rounded-md px-8 py-4 font-display text-xl uppercase tracking-wide"
            >
              Hablar con nosotros
            </a>
          </div>

          {/* Vista previa real de la interfaz — para que la promesa se
              vea concreta, no solo una frase */}
          <div className="rounded-xl border border-podium-chalk/10 bg-podium-chalk text-podium-asphalt shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-6 max-w-sm mx-auto text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/40 mb-4">
              Así lo ve tu socio
            </p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display text-xl uppercase leading-none">Socio de ejemplo</p>
                <p className="font-mono text-[10px] text-podium-asphalt/40 mt-1">#3 del ranking</p>
              </div>
              <div className="flex items-center gap-1.5 text-podium-gold shrink-0">
                <IconStreak className="w-5 h-5" />
                <span className="font-display text-2xl tabular">6</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-podium-asphalt/10 overflow-hidden mb-2">
              <div className="h-full bg-podium-track rounded-full" style={{ width: "70%" }} />
            </div>
            <p className="font-mono text-[10px] text-podium-asphalt/50">
              1.240 / 1.750 XP hacia &quot;Mes gratis&quot;
            </p>
          </div>
        </div>
      </section>

      {/* EL PROBLEMA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/40 mb-4 text-center">
            El problema
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-center mb-12">
            El 30-50% de los socios nuevos
            <br />
            se da de baja en los primeros 6 meses
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <StatCard value="30-50%" label="Churn en los primeros 6 meses" />
            <StatCard value="1 socio" label="Retenido al mes ya paga la herramienta" />
          </div>
        </div>
      </section>

      <div className="lane-divider max-w-3xl mx-auto" />

      {/* LA SOLUCIÓN */}
      <section className="px-6 py-20 bg-podium-asphalt/[0.025]">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/40 mb-4 text-center">
            Cómo funciona
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-center mb-14">
            Cuatro piezas, cero fricción
          </h2>

          <div className="flex flex-col gap-10">
            <FeatureRow
              icon={IconTap}
              tag="01 · Fichaje"
              title="Una placa junto a la entrada, nada más"
              desc="El socio toca al entrar y al salir. Sin app que descargar, sin login. Solo contamos lo que sí podemos medir de forma fiable: que estuvo entrenando al menos 45 minutos."
            />
            <FeatureRow
              icon={IconShield}
              tag="02 · Radar de riesgo"
              title="Sabes quién se va a ir antes de que se vaya"
              desc="Cada lunes, tu equipo recibe una lista clara: socios activos, en descenso y en riesgo real de baja — con nombre y racha. Nada de revisar hojas de cálculo."
            />
            <FeatureRow
              icon={IconTrophy}
              tag="03 · Premios y ranking"
              title="Cada sesión suma XP hacia un premio real"
              desc="Batidos, descuentos, meses gratis — tú decides el premio. El socio ve su progreso en el móvil, y el ranking del gimnasio salta en la pantalla de la sala."
            />
            <FeatureRow
              icon={IconSun}
              tag="04 · Horas valle"
              title="Llena las horas muertas, no solo las punta"
              desc="Tú decides el tramo horario y el bonus de XP. Los socios con horario flexible tienen un motivo real para venir cuando tu gimnasio está más vacío, no solo a las 19h como todos."
            />
          </div>
        </div>
      </section>

      <div className="lane-divider max-w-3xl mx-auto" />

      {/* PRECIO */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/40 mb-4 text-center">
            Precio
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-center mb-4">
            Tres tarifas, sin permanencia
          </h2>
          <p className="text-podium-asphalt/60 text-center max-w-xl mx-auto mb-14">
            Como fundador entre los primeros gimnasios, te llevas la tarifa{" "}
            <span className="font-semibold text-podium-asphalt">Premium</span> al
            precio de la <span className="font-semibold text-podium-asphalt">Básica</span> —
            congelado de por vida, no es un descuento de lanzamiento que suba luego.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            <PricingCard
              name="Básico"
              price="49€"
              features={[
                "Fichaje NFC ilimitado",
                "Radar de Riesgo semanal",
                "Ranking y racha individual",
                "Hasta 5 premios activos",
                "App para socios",
              ]}
            />
            <PricingCard
              name="Premium"
              price="49€"
              originalPrice="69€"
              badge="Precio fundador"
              highlighted
              features={[
                "Todo lo de Básico",
                "Premios ilimitados",
                "Horas valle (bonus de XP)",
                "Equipos de 2-4 socios",
                "Pantalla TV para la sala",
              ]}
            />
            <PricingCard
              name="Pro"
              price="99€"
              features={[
                "Todo lo de Premium",
                "Analítica avanzada del dashboard",
                "Soporte prioritario",
                "Onboarding personalizado",
              ]}
            />
          </div>

          <p className="font-mono text-[11px] text-podium-asphalt/40 text-center mt-8">
            Placa NFC de entrada incluida en las tres tarifas · sin permanencia
          </p>
        </div>
      </section>

      <footer className="border-t border-podium-asphalt/10 px-6 py-8 text-center">
        <p className="font-mono text-[11px] text-podium-asphalt/40">
          Ryvo · Sevilla · MVP en fase de piloto
        </p>
      </footer>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-podium-asphalt/15 bg-white p-6 text-center shadow-[0_1px_3px_rgba(27,27,31,0.06)]">
      <p className="font-display text-4xl tabular text-podium-track-dark mb-2">{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50">
        {label}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  originalPrice,
  badge,
  highlighted,
  features,
}: {
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
}) {
  return (
    <div
      className={`rounded-lg p-7 flex flex-col h-full transition-all ${
        highlighted
          ? "border-2 border-podium-track bg-white shadow-[0_8px_28px_rgba(143,212,0,0.18)] sm:-translate-y-3"
          : "border border-podium-asphalt/15 bg-white shadow-[0_1px_3px_rgba(27,27,31,0.06)]"
      }`}
    >
      {badge && (
        <span className="self-start bg-podium-track text-podium-asphalt font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
          {badge}
        </span>
      )}
      <p className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-2">
        {name}
      </p>
      <div className="flex items-baseline gap-2 mb-1">
        <p className="font-display text-5xl tabular">{price}</p>
        {originalPrice && (
          <p className="font-mono text-lg text-podium-asphalt/30 line-through">{originalPrice}</p>
        )}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-podium-asphalt/40 mb-6">
        / mes{originalPrice ? " · congelado de por vida" : ""}
      </p>
      <ul className="text-sm text-podium-asphalt/70 flex flex-col gap-2 mb-8 text-left flex-1">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`block text-center rounded-md py-3.5 font-display text-lg uppercase tracking-wide transition-all hover:-translate-y-0.5 ${
          highlighted
            ? "bg-podium-track hover:bg-podium-track-dark hover:shadow-[0_8px_20px_rgba(143,212,0,0.3)] text-podium-asphalt"
            : "border border-podium-asphalt/20 hover:border-podium-asphalt/40"
        }`}
      >
        Empezar
      </Link>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  tag,
  title,
  desc,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  tag: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-podium-asphalt/10 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(27,27,31,0.06)] hover:shadow-[0_8px_20px_rgba(27,27,31,0.08)] hover:-translate-y-0.5 transition-all">
      <div className="grid sm:grid-cols-[140px_1fr] gap-3 sm:gap-8">
        <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-3">
          <IconBadge icon={Icon} tone="track" />
          <p className="font-mono text-xs uppercase tracking-widest text-podium-track-dark">{tag}</p>
        </div>
        <div>
          <h3 className="font-display text-2xl uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-podium-asphalt/60 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
