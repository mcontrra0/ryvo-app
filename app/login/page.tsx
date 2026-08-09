"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GYM_NAME } from "@/lib/mockData";
import { login, ROLE_HOME } from "@/lib/auth";
import Logo from "@/components/Logo";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit() {
    const session = login(username, password);
    if (!session) {
      setError(true);
      return;
    }
    const redirectTo = params.get("next") || ROLE_HOME[session.role];
    router.push(redirectTo);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-podium-chalk text-podium-asphalt px-6 py-16">
      <div className="max-w-xs w-full">
        <Logo size="lg" className="justify-center mb-6" />
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-2 text-center">
          {GYM_NAME}
        </p>
        <h1 className="font-display text-4xl uppercase tracking-tight mb-8 text-center">
          Entrar
        </h1>

        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(false);
            }}
            placeholder="Usuario"
            className="bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-3 placeholder:text-podium-asphalt/30 focus:outline-none focus:border-podium-track-dark"
          />
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            type="password"
            placeholder="Contraseña"
            className="bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-3 placeholder:text-podium-asphalt/30 focus:outline-none focus:border-podium-track-dark"
          />
          {error && (
            <p className="font-mono text-xs text-podium-danger">
              Usuario o contraseña incorrectos.
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!username || !password}
            className="mt-1 bg-podium-track hover:bg-podium-track-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md py-4 font-display text-xl uppercase tracking-wide text-podium-asphalt"
          >
            Entrar
          </button>
        </div>

        <p className="font-mono text-[10px] text-podium-asphalt/30 mt-6 text-center leading-relaxed">
          Demo — pide las 3 credenciales de prueba (socio / CEO / TV)
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
