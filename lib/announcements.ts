// Contenido simulado del modo cartelería digital de la TV — en
// producción esto lo edita el propio dueño desde el dashboard (fase
// siguiente, no incluida aún en este MVP).

export interface Announcement {
  eyebrow: string;
  title: string;
  body: string;
}

export const announcements: Announcement[] = [
  {
    eyebrow: "Horario",
    title: "Este viernes cerramos a las 20:00",
    body: "Por reforma de vestuarios. Abrimos con normalidad el sábado a las 9:00.",
  },
  {
    eyebrow: "Próxima clase",
    title: "Zumba · 19:30 · Sala 2",
    body: "Plazas limitadas — apúntate en recepción o pregunta a tu monitor.",
  },
  {
    eyebrow: "Oferta del mes",
    title: "Batido de proteína a 2€",
    body: "Solo para socios Ryvo, todo agosto, en la barra del gimnasio.",
  },
];
