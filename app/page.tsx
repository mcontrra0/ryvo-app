import Link from "next/link";
import Logo from "@/components/Logo";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-podium-chalk text-podium-asphalt">
      {/* 🧪 BANNER DE PRUEBA — confirma que el push automático a Vercel
          funciona. Se quita en el siguiente cambio. */}
      <div className="bg-podium-track text-podium-asphalt text-center py-3 font-mono text-sm uppercase tracking-widest">
        🚀 Despliegue automático funcionando — este banner es de prueba
      </div>

      {/* HERO */}
      <section className="bg-podium-asphalt text-podium-chalk px-6 pt-14 pb-24">
        <div className="max-w-3xl mx-auto text-center">
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-podium-track hover:bg-podium-track-dark transition-colors rounded-md px-8 py-4 font-display text-xl uppercase tracking-wide text-podium-asphalt"
            >
              Ver la demo
            </Link>
            <a
              href="mailto:hola@ryvo.app"
              className="border border-podium-chalk/30 hover:border-podium-chalk/60 transition-colors rounded-md px-8 py-4 font-display text-xl uppercase tracking-wide"
            >
              Hablar con nosotros
            </a>
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
          <div className="grid sm:grid-cols-3 gap-6">
            <StatCard value="30-50%" label="Churn en los primeros 6 meses" />
            <StatCard value="1 socio" label="Retenido al mes ya paga la herramienta" />
            <StatCard value="0€" label="De integración con tu software actual" />
          </div>
        </div>
      </section>

      <div className="lane-divider max-w-3xl mx-auto" />

      {/* LA SOLUCIÓN */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/40 mb-4 text-center">
            Cómo funciona
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-center mb-14">
            Tres piezas, cero fricción
          </h2>

          <div className="flex flex-col gap-10">
            <FeatureRow
              tag="01 · Fichaje"
              title="Una placa junto a la entrada, nada más"
              desc="El socio toca al entrar y al salir. Sin app que descargar, sin login. Solo contamos lo que sí podemos medir de forma fiable: que estuvo entrenando al menos 45 minutos."
            />
            <FeatureRow
              tag="02 · Radar de riesgo"
              title="Sabes quién se va a ir antes de que se vaya"
              desc="Cada lunes, tu equipo recibe una lista clara: socios activos, en descenso y en riesgo real de baja — con nombre y racha. Nada de revisar hojas de cálculo."
            />
            <FeatureRow
              tag="03 · Premios y ranking"
              title="Cada sesión suma XP hacia un premio real"
              desc="Batidos, descuentos, meses gratis — tú decides el premio. El socio ve su progreso en el móvil, y el ranking del gimnasio salta en la pantalla de la sala."
            />
          </div>
        </div>
      </section>

      <div className="lane-divider max-w-3xl mx-auto" />

      {/* PRECIO */}
      <section className="px-6 py-20">
        <div className="max-w-md mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/40 mb-4">
            Precio
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tight mb-8">
            Precio fundador
          </h2>
          <div className="rounded-lg border border-podium-asphalt/15 p-8">
            <p className="font-display text-6xl tabular mb-1">49€</p>
            <p className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-6">
              / mes · congelado de por vida para los primeros gimnasios
            </p>
            <ul className="text-sm text-podium-asphalt/70 flex flex-col gap-2 mb-8 text-left">
              <li>✓ Placa NFC de entrada incluida</li>
              <li>✓ Radar de riesgo semanal</li>
              <li>✓ Ranking y premios ilimitados</li>
              <li>✓ Sin permanencia</li>
            </ul>
            <Link
              href="/login"
              className="block bg-podium-track hover:bg-podium-track-dark transition-colors rounded-md py-4 font-display text-lg uppercase tracking-wide text-podium-asphalt"
            >
              Empezar el piloto gratis
            </Link>
          </div>
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
    <div className="rounded-lg border border-podium-asphalt/15 p-6 text-center">
      <p className="font-display text-4xl tabular text-podium-track-dark mb-2">{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50">
        {label}
      </p>
    </div>
  );
}

function FeatureRow({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="grid sm:grid-cols-[140px_1fr] gap-2 sm:gap-8">
      <p className="font-mono text-xs uppercase tracking-widest text-podium-track-dark">{tag}</p>
      <div>
        <h3 className="font-display text-2xl uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-podium-asphalt/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
