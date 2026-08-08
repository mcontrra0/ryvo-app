"use client";

import { setDeviceMemberId } from "./memberStore";

// ============================================================
// Sistema de login de DEMO — no es el flujo real de producción.
// El socio real nunca ve un login (esa es la gracia del NFC: cero
// fricción). Esto existe solo para poder "entrar como" cada perfil
// y ver exactamente su pantalla, sin tener que fichar físicamente
// cada vez que quieras probar una vista distinta.
//
// En producción esto se sustituye por Supabase Auth de verdad, con
// contraseñas hasheadas y roles gestionados en base de datos — nunca
// credenciales en texto plano en el código, como aquí.
// ============================================================

export type Role = "socio" | "ceo" | "monitor" | "tv";

export interface DemoUser {
  username: string;
  password: string;
  role: Role;
  displayName: string;
  memberId?: string; // solo el rol "socio": a qué socio de prueba se asocia
}

export const DEMO_USERS: DemoUser[] = [
  {
    username: "socio",
    password: "socio1234",
    role: "socio",
    displayName: "Lucía Ferrer",
    memberId: "m1",
  },
  {
    username: "ceo",
    password: "ceo1234",
    role: "ceo",
    displayName: "Dueño del gimnasio",
  },
  {
    username: "monitor",
    password: "monitor1234",
    role: "monitor",
    displayName: "Monitor / entrenador",
  },
  {
    username: "tv",
    password: "tv1234",
    role: "tv",
    displayName: "Pantalla de sala",
  },
];

const SESSION_KEY = "podium_session";

export interface Session {
  username: string;
  role: Role;
  displayName: string;
}

export const ROLE_HOME: Record<Role, string> = {
  socio: "/app",
  ceo: "/dashboard",
  monitor: "/monitor",
  tv: "/tv",
};

export function login(username: string, password: string): Session | null {
  const user = DEMO_USERS.find(
    (u) => u.username === username.trim().toLowerCase() && u.password === password
  );
  if (!user) return null;

  const session: Session = {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Si es el rol "socio", vincula este dispositivo al socio de prueba
  // — así /checkin y /mi-ranking funcionan igual que si ya se hubiera
  // registrado, sin tener que rellenar el formulario otra vez.
  if (user.role === "socio" && user.memberId) {
    setDeviceMemberId(user.memberId);
  }

  return session;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
