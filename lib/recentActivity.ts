// Actividad reciente simulada para el ticker en directo de la TV.
// En producción esto es un listener de Supabase Realtime sobre la
// tabla `checkins` — cada fichaje válido nuevo entra aquí al instante.

export interface ActivityEvent {
  memberName: string;
  xp: number;
  kind: "sesion" | "clase";
}

export const recentActivity: ActivityEvent[] = [
  { memberName: "Elena Castro", xp: 120, kind: "sesion" },
  { memberName: "Lucía Ferrer", xp: 100, kind: "sesion" },
  { memberName: "Noa Jiménez", xp: 40, kind: "clase" },
  { memberName: "Iván Rueda", xp: 110, kind: "sesion" },
  { memberName: "Marcos Villa", xp: 40, kind: "clase" },
];
