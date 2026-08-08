// Datos simulados de actividad mensual — en producción esto se calcula
// con una consulta agregada sobre la tabla `checkins` de Supabase
// (group by mes, count de sesiones válidas y de socios activos).

export interface MonthlyStat {
  mes: string;
  sesionesValidas: number;
  sociosActivos: number;
}

export const monthlyStats: MonthlyStat[] = [
  { mes: "Mar", sesionesValidas: 210, sociosActivos: 22 },
  { mes: "Abr", sesionesValidas: 245, sociosActivos: 25 },
  { mes: "May", sesionesValidas: 268, sociosActivos: 27 },
  { mes: "Jun", sesionesValidas: 252, sociosActivos: 26 },
  { mes: "Jul", sesionesValidas: 289, sociosActivos: 29 },
  { mes: "Ago", sesionesValidas: 301, sociosActivos: 31 },
];

// Ambas métricas parten de escalas muy distintas (cientos vs decenas),
// así que para poder superponerlas en una sola gráfica y comparar su
// ritmo de crecimiento, las indexamos al primer mes = 100. Un valor de
// 130 significa "un 30% más que en el mes de partida".
export interface IndexedMonthlyStat extends MonthlyStat {
  indiceSesiones: number;
  indiceSocios: number;
}

export function getIndexedMonthlyStats(): IndexedMonthlyStat[] {
  const base = monthlyStats[0];
  return monthlyStats.map((m) => ({
    ...m,
    indiceSesiones: Math.round((m.sesionesValidas / base.sesionesValidas) * 100),
    indiceSocios: Math.round((m.sociosActivos / base.sociosActivos) * 100),
  }));
}
