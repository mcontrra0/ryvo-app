"use client";

import { useState } from "react";

export default function RegisterForm({
  onComplete,
}: {
  onComplete: (data: { fullName: string; phone: string; pin: string }) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const pinValid = /^\d{4}$/.test(pin);
  const canSubmit = fullName.trim().length > 0 && phone.trim().length > 0 && pinValid;

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
          className="bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-3 placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark text-lg"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono"
          inputMode="tel"
          className="bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-3 placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark"
        />
        <div>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="PIN de 4 dígitos"
            inputMode="numeric"
            type="password"
            className="w-full bg-transparent border border-podium-asphalt/25 rounded-md px-4 py-3 tracking-[0.4em] placeholder:tracking-normal placeholder:text-podium-asphalt/35 focus:outline-none focus:border-podium-track-dark"
          />
          <p className="font-mono text-[10px] text-podium-asphalt/40 mt-1.5">
            Con tu teléfono + este PIN podrás ver tu ranking desde cualquier
            dispositivo, no solo desde este móvil.
          </p>
        </div>
        <button
          onClick={() => canSubmit && onComplete({ fullName, phone, pin })}
          disabled={!canSubmit}
          className="mt-1 bg-podium-track hover:bg-podium-track-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md py-4 font-display text-xl uppercase tracking-wide text-podium-asphalt"
        >
          Empezar a entrenar →
        </button>
      </div>
    </div>
  );
}
