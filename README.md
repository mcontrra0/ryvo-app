# Ryvo — MVP (racha semanal, no diaria)

## Qué cambió en esta vuelta

- **Racha rediseñada: por semanas, no por días.** Exigir venir todos los
  días sin fallar uno castigaba a cualquiera con un patrón normal de
  3-4 sesiones/semana. Ahora la racha cuenta **semanas consecutivas**
  en las que se llega a un mínimo de sesiones (`MIN_SESSIONS_PER_WEEK`
  en `lib/types.ts`, de momento 2). `/mi-ranking` muestra además un
  indicador en vivo ("Esta semana: 3/2 sesiones ✓ racha asegurada")
  para que el socio vea su progreso sin esperar a que cierre la semana.
  La lógica vive en `lib/memberStore.ts` → `computeWeeklyUpdate`.

- **Editor de premios para el CEO** (`/dashboard`, pestaña "Premios") —
  crear, editar y borrar premios y su XP requerido, sin tocar código.
  Antes la escalera de premios era una lista fija en `lib/types.ts`;
  ahora cada gimnasio guarda la suya propia (`lib/rewardsStore.ts`,
  localStorage con clave `GYM_ID`), y `/mi-ranking` lee siempre la
  versión más reciente — edita un premio como CEO y el socio lo ve
  actualizado al momento.
- Arreglado: acceso al servidor de desarrollo desde el móvil
  (`next.config.ts` → `allowedDevOrigins`).
- Arreglado: centrado del logo (era `inline-flex`, ahora `flex`) y
  fuente propia para el wordmark "Ryvo" (Bebas Neue, vía `@fontsource`,
  funciona sin conexión a Google Fonts).
- Favicon corregido: ahora es el chevron del logo, no la letra "R".

## Credenciales de demo

| Rol | Usuario | Contraseña | A dónde lleva |
|---|---|---|---|
| Socio | `socio` | `socio1234` | `/app` → Fichar / Mi ranking (como Lucía Ferrer, socia de prueba) |
| CEO / dueño | `ceo` | `ceo1234` | `/dashboard` |
| Monitor | `monitor` | `monitor1234` | `/monitor` (pide además el PIN interno `1234`) |
| TV | `tv` | `tv1234` | `/tv` |

Entra por `/login` (o desde la landing en `/`, botón "Ver la demo").

**Importante — esto es una capa de demo, no el flujo real de producción.**
El socio de verdad nunca ve un login: en producción sigue entrando solo
tocando el NFC, sin fricción. Este login existe únicamente para que
puedas "entrar como" cada perfil sin tener que fichar físicamente cada
vez que quieras probar una vista distinta. Al iniciar sesión como
`socio`, el sistema vincula tu navegador al socio de prueba (Lucía
Ferrer) usando el mismo mecanismo de identidad por dispositivo que ya
usa el fichaje real — por eso `/checkin` y `/mi-ranking` funcionan igual
que si ya te hubieras registrado.

Cada pantalla de destino (`/dashboard`, `/tv`, `/monitor`, `/checkin`,
`/mi-ranking`) está protegida por `components/RequireRole.tsx`: si no hay
sesión, o el rol no coincide, redirige a `/login` sin mostrar nada del
contenido protegido de por medio.

## Qué cambió en esta vuelta (feedback operativo + ajustes de Gemini)

- **Racha corregida.** Antes sumaba +1 por cada sesión válida sin mirar el
  día — ahora se calcula por días distintos consecutivos de verdad
  (`lib/memberStore.ts` → `computeUpdatedRacha`).
- **Sesión abandonada ya no rompe el día siguiente.** Si una sesión lleva
  abierta más de 3 horas, se descarta como "olvidada" en vez de intentar
  cerrarla con una duración absurda al siguiente tap.
- **Botón "olvidé fichar" (`/mi-ranking`).** Cuando se detecta una sesión
  olvidada, el socio puede reclamar 100 XP base una vez por semana — sin
  necesidad de geofencing en segundo plano, que **no es viable con una
  PWA** (iOS/Android no dejan a una web seguir vigilando tu ubicación con
  la pestaña cerrada; por eso no lo implementamos, aunque estaba en el
  feedback de Gemini).
- **Aviso de GPS, no bloqueo.** Al fichar entrada se pide la ubicación una
  vez (no en segundo plano) y si está lejos del gimnasio se marca como
  anomalía para el dueño — nunca bloquea el fichaje ni penaliza al socio
  en el momento, porque el GPS en interiores falla demasiado como para
  confiar en él al 100%. (Nota: la validación por SSID de wifi que
  proponía el documento de Gemini no es técnicamente posible desde una
  web — ningún navegador expone esa información por privacidad. Si se
  quiere ese nivel de control, la alternativa real es comprobar la IP
  pública de origen contra la del router del gimnasio.)
- **Validación de clase por el monitor (`/monitor`), no por un segundo
  NFC.** Un NFC de honor en la sala de clases se puede tocar sin haber
  asistido. Ahora el propio monitor, que tiene la clase delante, marca
  quién ha venido de verdad desde una pantalla con PIN. Mucho más
  resistente al fraude.
- **Selector rápido de grupo muscular al fichar salida** (opcional,
  3 segundos, no bloquea el XP) — alimenta un desglose en el dashboard de
  "qué entrena la gente", sin fricción para el socio.
- **Módulo de cashback** (`/mi-ranking`) — alternativa al XP para
  gimnasios con socios que no conectan con la estética RPG: ven X días al
  mes → descuento en la cuota. Convive con el sistema de premios, no lo
  sustituye.
- **TV con modo cartelería digital.** Ahora rota automáticamente entre el
  ranking (20s) y anuncios del gimnasio (8s cada uno) — mismo espacio,
  doble utilidad para el dueño (horarios, avisos, promociones). Además,
  el diseño de la TV se rehizo por completo: mucho más contraste,
  tipografía más grande, pensado para verse desde el otro lado de la
  sala.
- **Gráfica de crecimiento relativo en el dashboard** — sesiones válidas
  y socios activos, indexados a 100 en el primer mes, superpuestos en una
  sola línea para comparar ritmos de crecimiento en vez de dos barras con
  escalas distintas.

## ⚠️ Simplificaciones de demo que hay que reforzar antes de producción

- **Las 4 credenciales están en texto plano en `lib/auth.ts`.** Sirve para
  probar el flujo, pero antes de un piloto real esto tiene que ser
  Supabase Auth de verdad, con contraseñas hasheadas y roles en base de
  datos — nunca credenciales legibles en el código fuente.
- **El PIN del monitor (`1234`) está fijo en el código.** Sirve para
  probar el flujo, pero antes de dárselo a un gimnasio real hace falta
  autenticación de personal de verdad (usuario/contraseña o PIN por
  empleado, gestionado desde Supabase Auth).
- La lista de "fichados hoy" que ve el monitor no distingue todavía entre
  quien ya recibió el bonus de clase y quien no — de momento vuelve a
  fallar en silencio (`awardClaseBonus` ya limita a una vez al día por
  socio, así que no se puede duplicar, pero el monitor no lo ve reflejado
  en la lista).


## Los seis flujos, separados por tipo de usuario

1. **Fichaje** (`/checkin?gym=<slug>`) — destino real del NFC/QR de
   entrada. Automático, sin app. Registro rápido de un paso la primera
   vez. Detecta sesiones abandonadas. Aviso GPS silencioso. Selector
   opcional de grupo muscular al salir.
2. **Mi ranking** (`/mi-ranking`) — puesto, XP, escalera de premios,
   cashback, banner de "olvidé fichar" cuando aplica, y el ranking del
   gimnasio.
3. **Modo monitor** (`/monitor`) — pantalla con PIN para que el
   entrenador registre asistencia real a su clase dirigida.
4. **Dashboard del dueño** (`/dashboard`) — tres pestañas: Radar de
   Riesgo (con aviso de anomalías GPS), Ranking, y Actividad (gráfica de
   crecimiento relativo + desglose de grupos musculares).
5. **Modo TV** (`/tv`) — ranking en pantalla de sala, rotando con
   cartelería digital del gimnasio.
6. **Landing de venta** (`/`) — la cara pública del producto.

Ahora mismo corre con un **backend simulado en el propio navegador**
(`lib/memberStore.ts`, sobre localStorage) para que todo el flujo
funcione de punta a punta sin crear ninguna cuenta todavía. La lógica de
negocio real es la misma que usará la versión conectada a Supabase, solo
cambia de dónde vienen los datos.

## ⚠️ Limitación importante de esta simulación (léelo antes de enseñarlo)

La identidad del socio vive en el **localStorage de su propio móvil** — es
así como sabemos, sin login, quién ficha la segunda vez. Esto tiene dos
consecuencias que hay que resolver al conectar Supabase:

- Si el socio cambia de móvil o borra datos del navegador, tendría que
  registrarse otra vez. Para el piloto con pocos socios es un riesgo
  asumible; si se convierte en problema real, la solución es enviar un
  código/enlace por SMS al registrarse, para poder "recuperar" el perfil
  desde cualquier móvil.
- La pantalla de **TV** es un dispositivo físicamente distinto al móvil del
  socio, así que en este prototipo **no puede ver en tiempo real lo que
  ficha alguien en otro móvil** (cada navegador tiene su propio
  localStorage aislado). Cuando conectes Supabase, el ranking de la TV
  tiene que leer de una tabla compartida en la nube vía Supabase Realtime
  — ahí sí se actualizará al instante entre dispositivos distintos, que es
  el efecto "salta la animación en la tele" que buscábamos desde el
  principio.
- Las gráficas de actividad mensual (`lib/monthlyStats.ts`) son datos de
  ejemplo — en producción se calculan con una consulta agregada sobre la
  tabla `checkins` (group by mes).

## Cómo arrancarlo en tu máquina

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Verás dos accesos: uno para simular que eres
un socio fichando, y otro para el panel del dueño.

## Qué falta para que sea real (siguientes pasos)

1. **Conectar Supabase de verdad.**
   - Crea un proyecto gratuito en [supabase.com](https://supabase.com).
   - Ve a *SQL Editor* y ejecuta el contenido de `supabase/schema.sql` — crea
     las tablas `gyms`, `members`, `checkins` y la vista `member_activity`
     que ya calcula los datos que necesita el Radar de Riesgo.
   - Copia `.env.example` a `.env.local` y rellena las dos variables con los
     valores de tu proyecto (*Project Settings → API*).
   - Sustituir `lib/mockData.ts` por llamadas reales a `lib/supabase.ts` en
     `app/checkin/page.tsx` y `app/dashboard/page.tsx` — esto es justo el
     tipo de tarea que le puedes pasar a Claude Code para que lo haga por ti
     de forma guiada.

2. **Fuentes de marca reales.** En este entorno de desarrollo no tuve acceso
   a Google Fonts, así que `app/layout.tsx` usa fuentes de sistema como
   fallback. El código para restaurar Oswald + Inter + IBM Plex Mono está
   comentado ahí mismo — en Vercel funcionará sin tocar nada más.

3. **NFC real.** Cuando tengas los tags NFC, la URL que graben debe apuntar
   a `/checkin?gym=<slug-del-gimnasio>&token=<token-secreto>` — ahora mismo
   el `token` no se valida todavía (es lo primero que hay que añadir antes
   de dar el sistema por seguro frente a fraude básico).

4. **Autenticación del dueño.** El `/dashboard` es público en este
   prototipo — antes de dárselo a un gimnasio real hace falta login.

## Estructura del proyecto

```
app/
  page.tsx              → landing de venta (pública, explica el producto)
  app/page.tsx           → router por tipo de usuario (los 5 accesos)
  checkin/page.tsx        → fichaje automático + registro + bonus de clase
  mi-ranking/page.tsx      → ranking personal + escalera de premios (socio)
  dashboard/page.tsx       → Radar de Riesgo + Ranking + Actividad (dueño)
  tv/page.tsx                → pantalla de sala, modo kiosko (TV)
components/
  RegisterForm.tsx        → registro rápido de 1 paso (solo primera vez)
  MemberRiskRow.tsx        → fila de socio con su nivel de riesgo
lib/
  types.ts                 → lógica de negocio: computeRisk(), REWARDS
  mockData.ts               → socios de ejemplo (Box Rinconada)
  monthlyStats.ts            → datos de ejemplo para las gráficas mensuales
  memberStore.ts              → "backend" simulado en localStorage: registro,
                                XP, bonus de clase, ranking
  supabase.ts                 → cliente de Supabase (listo para cuando conectes)
supabase/
  schema.sql                    → esquema completo para pegar en el SQL Editor
```

## Siguiendo en Claude Code

Este proyecto está pensado para continuar en Claude Code desde aquí. Una
buena primera tarea para darle sería:

> "Conecta este proyecto a mi proyecto de Supabase (las credenciales están
> en .env.local) y sustituye los datos simulados de mockData.ts por
> consultas reales a las tablas del esquema, manteniendo la misma lógica de
> computeRisk()."
