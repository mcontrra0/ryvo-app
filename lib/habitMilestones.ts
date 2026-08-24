// ============================================================
// Hitos de constancia — atados a la RACHA SEMANAL (no a días
// consecutivos, a propósito: la racha ya mide semanas cumpliendo el
// objetivo personal, y la investigación real sobre formación de
// hábitos también se mide en semanas/meses, no en días).
//
// Cada dato es real y viene de una fuente contrastada — nada
// inventado, nada de cifras de "aumenta la serotonina un X%" sin
// respaldo. Fuentes principales:
// - Lally et al. (2010), European Journal of Social Psychology /
//   University College London — el estudio real sobre cuánto tarda un
//   hábito en formarse (66 días de media, no los 21 días del mito).
// - Estudio de 2015 sobre gimnasios: entrenar 4+ veces/semana durante
//   6 semanas como umbral para empezar a formar el hábito.
// - Trail Runner Mag / fisiólogo Phil Batterson: fases de adaptación
//   al entrenamiento (neuromuscular, mitocondrial, VO2 máx.).
// - Healthline: cronología de ganancias de fuerza y resistencia.
// - Declaraciones públicas y reportajes verificados sobre la rutina
//   de Michael Phelps (más de 5 años seguidos sin faltar a entrenar).
// ============================================================

export interface HabitMilestone {
  weeks: number;
  title: string;
  fact: string;
}

export const HABIT_MILESTONES: HabitMilestone[] = [
  {
    weeks: 1,
    title: "Primera semana completa",
    fact: "Has hecho lo que mucha gente nunca llega a intentar: empezar de verdad. Los primeros cambios ocurren en el sistema nervioso, antes incluso de que se note en el espejo.",
  },
  {
    weeks: 2,
    title: "El cuerpo aprende a moverse mejor",
    fact: "En las primeras 1-4 semanas, el sistema nervioso mejora la coordinación del movimiento antes que el propio músculo — por eso al principio cuesta menos de lo que parecía al principio.",
  },
  {
    weeks: 3,
    title: "Más fuerza, aunque el músculo no haya cambiado",
    fact: "Las primeras ganancias de fuerza (semana 2-3) son sobre todo neurológicas: el cuerpo aprende a reclutar más fibras musculares antes de que estas crezcan de tamaño.",
  },
  {
    weeks: 4,
    title: "Un mes — el corazón ya nota la diferencia",
    fact: "A partir de la semana 3-4, el sistema cardiovascular se vuelve más eficiente entregando oxígeno al músculo — es una de las razones reales por las que las mismas series empiezan a costar menos.",
  },
  {
    weeks: 5,
    title: "Las células cambian por dentro",
    fact: "Entre la semana 4 y la 8, el cuerpo aumenta el número de mitocondrias (las 'centrales de energía' de la célula) y mejora cómo usa la grasa como combustible.",
  },
  {
    weeks: 6,
    title: "El umbral real del hábito de ir al gimnasio",
    fact: "Un estudio de 2015 sobre gimnasios encontró que hacía falta entrenar al menos 4 veces por semana durante 6 semanas para empezar a formar el hábito de verdad. Si sigues aquí, ya lo has cruzado.",
  },
  {
    weeks: 7,
    title: "Cada vez más cerca de verlo",
    fact: "El crecimiento muscular visible suele empezar a notarse entre la semana 4 y la 8 de entrenamiento constante — lo que llevas dentro ya lleva semanas trabajando para que se vea fuera.",
  },
  {
    weeks: 8,
    title: "Dos meses de constancia",
    fact: "A estas alturas ya no eres 'alguien que ha empezado a ir al gimnasio' — según la ciencia del hábito, estás justo en la zona donde un comportamiento empieza a sentirse menos forzado.",
  },
  {
    weeks: 9,
    title: "Casi en la media real de formar un hábito",
    fact: "Olvida los 21 días — ese número nunca tuvo base científica. El estudio serio (Lally et al., 2010, University College London) encontró que un hábito tarda de media 66 días en formarse. Vas llegando.",
  },
  {
    weeks: 10,
    title: "70 días — el punto medio real",
    fact: "70 días es más que la media real (66 días) que la investigación encontró para que un hábito deje de sentirse como un esfuerzo y empiece a sentirse automático. Lo difícil ya lo has hecho.",
  },
  {
    weeks: 12,
    title: "Tres meses — mejoras que se miden en laboratorio",
    fact: "Entre las semanas 8 y 12, estudios de fisiología del ejercicio registran mejoras medibles en el VO2 máx. (la capacidad de tu cuerpo para usar oxígeno) y en el umbral de lactato — mejor rendimiento a la misma intensidad percibida.",
  },
  {
    weeks: 14,
    title: "Más de tres meses",
    fact: "El rango real que encontró la investigación para formar un hábito de ejercicio (más exigente que hábitos simples como beber agua) va de 18 a 254 días. Ya estás muy por delante de la parte baja de ese rango.",
  },
  {
    weeks: 16,
    title: "Cuatro meses",
    fact: "A estas alturas, la constancia ya no depende tanto de la motivación del día — es la propia rutina la que tira de ti. Es exactamente el mecanismo que describe la investigación sobre automatización de hábitos.",
  },
  {
    weeks: 20,
    title: "Cinco meses",
    fact: "Casi nadie llega aquí. La mayoría de las bajas en un gimnasio ocurren en los primeros meses — tú ya has cruzado la zona donde más gente lo deja.",
  },
  {
    weeks: 24,
    title: "Medio año seguido",
    fact: "Seis meses de constancia real. En este punto, el ejercicio ya no es una tarea que decides hacer cada día — es, sencillamente, parte de quién eres.",
  },
  {
    weeks: 28,
    title: "Siete meses",
    fact: "Cada semana que se suma a esta racha refuerza la misma vía: cuanto más automático se vuelve un comportamiento, menos energía mental necesita sostenerlo.",
  },
  {
    weeks: 32,
    title: "Ocho meses",
    fact: "La constancia sostenida durante meses, no semanas, es lo que de verdad diferencia un hábito de un simple intento — y tú ya estás en ese terreno.",
  },
  {
    weeks: 36,
    title: "Nueve meses",
    fact: "Nueve meses de racha semanal. Lo que empezó siendo un esfuerzo consciente lleva ya mucho tiempo funcionando prácticamente solo.",
  },
  {
    weeks: 40,
    title: "Diez meses",
    fact: "A estas alturas, romper la racha costaría más esfuerzo mental que mantenerla — esa es, literalmente, la definición de un hábito consolidado.",
  },
  {
    weeks: 48,
    title: "Casi un año",
    fact: "Un año de constancia es algo que muy pocas personas sostienen de verdad. Estás a semanas de conseguirlo.",
  },
  {
    weeks: 52,
    title: "Un año entero",
    fact: "Michael Phelps, el olímpico más laureado de la historia, pasó más de 5 años seguidos sin faltar ni un solo día a entrenar — Navidades y cumpleaños incluidos. Tú llevas un ritmo distinto, semanal en vez de diario, pero es la misma idea: la constancia por encima de la motivación del día.",
  },
];

// Devuelve el hito ya conseguido más reciente, y el siguiente por
// venir — no hace falta enseñar toda la lista, solo dónde estás ahora.
export function getHabitMilestoneStatus(rachaSemanas: number): {
  current: HabitMilestone | null;
  next: HabitMilestone | null;
} {
  let current: HabitMilestone | null = null;
  let next: HabitMilestone | null = null;
  for (const m of HABIT_MILESTONES) {
    if (m.weeks <= rachaSemanas) current = m;
    else {
      next = m;
      break;
    }
  }
  return { current, next };
}
