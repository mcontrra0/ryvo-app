// Actividad reciente simulada para el ticker en directo de la TV.
// En producción esto es un listener de Supabase Realtime sobre la
// tabla `checkins` — cada fichaje válido nuevo entra aquí al instante.

export interface ActivityEvent {
  memberName: string;
  xp: number;
}

export const recentActivity: ActivityEvent[] = [
  { memberName: "Elena Castro", xp: 120 },
  { memberName: "Lucía Ferrer", xp: 100 },
  { memberName: "Noa Jiménez", xp: 90 },
  { memberName: "Iván Rueda", xp: 110 },
  { memberName: "Marcos Villa", xp: 100 },
];
