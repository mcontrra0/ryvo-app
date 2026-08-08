"use client";

import { useState } from "react";

export default function RegisterForm({
  onComplete,
}: {
  onComplete: (data: { fullName: string; phone?: string }) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 mb-1">
          Primera vez por aquí 👋
        </p>
        <h1 className="font-display text-3xl uppercase tracking-tight leading-tight">
          ¿Cómo te llamas?
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <input
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre"
          className="bg-transparent border border-podium-asphalt/30 rounded-md px-4 py-3 placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark text-lg"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="bg-transparent border border-podium-asphalt/30 rounded-md px-4 py-3 placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark"
        />
        <button
          onClick={() => fullName.trim() && onComplete({ fullName, phone })}
          disabled={!fullName.trim()}
          className="mt-1 bg-podium-track hover:bg-podium-track-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md py-4 font-display text-xl uppercase tracking-wide text-podium-asphalt"
        >
          Empezar a entrenar →
        </button>
        <p className="text-center font-mono text-[11px] text-podium-asphalt/40">
          10 segundos, nada más. Solo esta vez.
        </p>
      </div>
    </div>
  );
}
