# Ryvo — MVP (hitos de constancia con datos reales, no inventados)

## Qué cambié en esta vuelta

- **Hitos de constancia en la pestaña Racha** (`lib/habitMilestones.ts`)
  — 21 hitos atados a la **racha semanal**, no a días consecutivos (a
  propósito: reintroducir "días seguidos" habría chocado con el
  rediseño de racha semanal que ya hicimos, y la investigación real
  sobre hábitos también se mide en semanas/meses). Cada hito trae un
  dato **verificado de verdad** — nada de cifras inventadas tipo
  "aumenta la serotonina un X%":
  - Semanas 1-10, una por semana: adaptación neuromuscular temprana,
    eficiencia cardiovascular, el estudio de 2015 sobre el umbral real
    para formar el hábito de ir al gimnasio (4×/semana durante 6
    semanas), y los **66 días de media** que de verdad tarda un hábito
    en formarse (Lally et al. 2010, University College London) — no
    los 21 días del mito, que nunca tuvo base científica.
  - A partir de ahí, el ritmo baja (cada 2 semanas hasta el medio año,
    luego cada mes) — mejoras de VO2 máx./umbral de lactato hacia el
    mes 3, y en el hito de 1 año, el dato verificado de que Michael
    Phelps pasó más de 5 años seguidos sin faltar un solo día a
    entrenar.
  - Se muestra el hito ya conseguido más reciente (con su dato) y el
    siguiente asomando bloqueado — no la lista entera de golpe.

- **Arreglado `IconStreak`** — el trazo de la llama era demasiado
  complejo para tamaños pequeños y se deformaba (se veía como una
  comilla rota junto al "6" de racha en la landing). Sustituido por un
  trazo más simple que aguanta bien en miniatura.
- **Dos vistas previas ilustrativas nuevas** en "Cómo funciona" — una
  del Radar de Riesgo (semáforo de socios) junto a esa tarjeta, y un
  podio de ranking junto a la de Premios. Mismo criterio que la
  primera: reconstruidas con nuestros propios colores y componentes,
  no capturas reales.
- ⚠️ **Las capturas reales de la app siguen pendientes** — mi entorno
  no tiene acceso a `vercel.app` ni `supabase.co`, así que no puedo
  capturarlas yo mismo. En cuanto me pases pantallazos de verdad, los
  sustituyo por fotos reales de la app en vez de estas ilustraciones.

- **De una tarifa única a tres** (Básico 49€, Premium 69€, Pro 99€) en
  la landing. La oferta de fundador ya no es "todos pagan 49€" — ahora
  es **"los primeros gimnasios se llevan Premium al precio de Básico"**,
  con el precio original tachado y una insignia "Precio fundador"
  destacando la tarjeta del medio.
- ⚠️ **Esto es solo la landing (marketing), no hay gating real en el
  código.** El software no distingue todavía entre tarifas — cualquier
  gimnasio tiene acceso a todo lo construido, sin importar qué tarifa
  se le prometa. Construir el bloqueo de funciones por tarifa sería un
  proyecto aparte; para un piloto de un solo gimnasio no hace falta
  todavía.

- **Quitada la afirmación "0€ de integración con tu software actual"**
  — no tenía sentido, no existe integración con otros sistemas. La
  sección "El problema" pasa de 3 a 2 estadísticas, ambas reales.
- **Hero con profundidad y prueba visual concreta** — degradado radial
  sutil de fondo (antes plano), y una tarjeta que enseña "así lo ve tu
  socio" (racha, XP, progreso hacia un premio) con el mismo lenguaje
  visual real de la app, para que la promesa se vea tangible en vez de
  solo texto.
- **"Cómo funciona" con tarjetas de verdad** — cada punto era una fila
  de texto suelta; ahora son tarjetas elevadas con sombra y un ligero
  efecto al pasar el ratón, sobre una sección con fondo ligeramente
  distinto para dar ritmo entre secciones.
- **Botones con hover más premium** en toda la landing (leve elevación
  + sombra de color al pasar el ratón) — antes solo cambiaba el color.

- **Nueva pestaña "Equipo" en `/mi-ranking`.** Grupos cerrados de 2 a 4
  socios, creados por ellos mismos (un socio solo puede estar en uno a
  la vez). Se une por código o enlace de invitación
  (`/mi-ranking?join=CÓDIGO`, se abre directo en la pestaña correcta y
  precarga el código).
  - **Sin "puntuación de grupo" que castigue** — cada socio conserva su
    propio XP y objetivo semanal intactos. El equipo solo hace visible
    el estado de cada uno frente a SU propio objetivo esta semana
    ("Marco: 2/2 ✓ · Sara: 0/2"), para dar el empujón social sin que
    nadie "arrastre hacia abajo" el número de otro.
  - **Ranking de equipos** — ordenado por la SUMA de XP de sus
    miembros (nunca resta un miembro flojo, solo suma menos).
  - Tablas nuevas: `teams`, `team_members` (`lib/teamStore.ts`).
  - ⚠️ Límite conocido: si alguien abre el enlace de invitación sin
    estar registrado todavía, el código no sobrevive al paso de
    registro — tendría que pedir el código de nuevo después. Aceptable
    para esta versión, pero queda anotado.

- **Logros por sesiones totales, arreglados dos veces en la misma
  vuelta.** Primero: el "10 sesiones" solo se explicaba en un `title`
  (tooltip de ratón), invisible en móvil — ahora el texto está visible
  en la propia insignia. Segundo, más de fondo: la lista era fija (10,
  25, 50, 100, 200) y se agotaba — alguien con años de gimnasio se
  quedaba con todo desbloqueado y nada más que perseguir. Ahora es
  **exponencial y sin límite** (10, 25, 50, 100, 250, 500, 1000,
  2500...) — cada hito exige proporcionalmente más que el anterior, y
  `/mi-ranking` siempre muestra una ventana de 5 alrededor del
  progreso real del socio (2 ya conseguidos + los siguientes por
  venir), calculada con `getMilestoneWindow` en `lib/types.ts`.

- **Elevación consistente.** Casi ninguna tarjeta tenía sombra en toda
  la app (todo era borde plano) — añadida una sombra sutil coherente
  (`shadow-[0_1px_3px_rgba(27,27,31,0.06)]`) a las tarjetas principales
  de `/dashboard`, `/mi-ranking`, `RewardsEditor`, `/admin` y
  `StreakCard`. Es el tipo de detalle que hace que un diseño se sienta
  cuidado en vez de plano.
- **KPI del dashboard sin emoji.** Se habían colado otra vez emoji
  genéricos (🟢🔴📈) justo después de arreglar la navegación —
  sustituidos por `IconBadge` con iconos propios (`IconUser`,
  `IconAlert`, `IconTrend`). El semáforo 🟢🟡🔴 del Radar de Riesgo se
  deja tal cual, a propósito — ahí sí funciona como semáforo real.
- **Landing con el mismo lenguaje visual que el resto de la app.** Los
  4 puntos de "Cómo funciona" no tenían ningún icono — añadida una
  insignia por punto (`IconTap`, `IconShield`, `IconTrophy`,
  `IconSun`). De paso, arreglado el titular: decía "Tres piezas" con
  cuatro puntos debajo (desde que añadimos Horas valle, nadie lo
  actualizó).
- **Estados vacíos con apoyo visual**, no solo texto — icono de trofeo
  atenuado en "todavía no hay premios" (`RewardsEditor` y `/mi-ranking`).

- **Quitado el sistema de cashback por completo.** Ya no convencía
  como funcionalidad. Eliminado: `lib/cashbackStore.ts` entero, la
  interfaz `CashbackRule` y sus campos en `Member`
  (`sessionDaysThisMonth`, `cashbackMonthKey`), la sección del CEO en
  `RewardsEditor`, y la tarjeta "Ahorro en tu cuota" de `/mi-ranking`.
  Las columnas correspondientes en Supabase (`gyms.cashback_*`,
  `members.cashback_month_key`) se quedan sin usar en la base de datos
  — mismo criterio que con el grupo muscular: no hacía falta otra
  migración solo para borrarlas, no molestan estando ahí.

- **Iconos propios en toda la app**, no solo en la navegación —
  añadidos `IconFreeze`, `IconLock`, `IconCheck`, `IconSun`,
  `IconAlert`, `IconPercent` (`components/icons.tsx`), y sustituidos
  emoji en `StreakCard`, `mi-ranking` (cashback, horas valle,
  escalera de premios), `checkin` (ya fichaste hoy, avisos de hora
  valle), `dashboard` (anomalías GPS), y `RewardsEditor`.
- **`IconBadge`** — insignia circular con fondo de color alrededor del
  icono, usada en cabeceras de sección para un acabado más cuidado que
  un emoji suelto.
- **Medallas del ranking con los colores de marca de verdad**
  (`podium-gold`/`silver`/`bronze`, ya existían como tokens pero no se
  usaban ahí) en vez de emoji 🥇🥈🥉 — círculos de color con el número
  dentro.
- Lo que se dejó **a propósito** sin tocar: los círculos 🔴🟡🟢 del
  Radar de Riesgo (funcionan como semáforo real, cambiar el color por
  un icono no mejora nada), y un par de emoji con tono cálido/humano
  en vez de genérico (👋 en el registro, 🚀 en el banner de la
  landing) — no todo necesita convertirse en icono de marca.

- **Iconos de navegación propios** (`components/icons.tsx`) — seis
  iconos monocromáticos dibujados a medida (heredan el color vía
  `currentColor`), sustituyendo los emoji genéricos de las pestañas en
  `/mi-ranking` y `/dashboard`. Dos conectan con la marca a propósito:
  Ranking usa bloques de podio, y Actividad un trazo ascendente que
  recuerda al icono del logo.
- **Barra de navegación móvil en oscuro con acento lima** — antes era
  blanca con texto gris (genérica, podría ser cualquier app). Ahora
  fondo `podium-asphalt`, borde superior lima, pestaña activa en lima
  brillante — mucho más de marca.
- Es un primer pase de identidad centrado en la navegación (lo más
  visible y usado todo el rato); el resto de la app (tarjetas, iconos
  sueltos tipo 🔥/🏆 dentro del contenido) sigue con emoji por ahora —
  si quieres, seguimos extendiendo este mismo lenguaje visual más
  adelante.

- **`/dashboard` con el mismo patrón de pestañas responsive que
  `/mi-ranking`.** Barra fija abajo con iconos en móvil, pestañas
  arriba en pantallas grandes — antes se quedaba arriba siempre,
  incómodo de alcanzar con el pulgar en el móvil.
- **"Cerrar sesión" en `/mi-ranking`.** Antes no había forma de
  "salir" desde ahí. Un socio real nunca pasa por `/login` (llega por
  NFC o teléfono+PIN), así que el botón no le manda ahí — desvincula
  el dispositivo (`clearDeviceMemberId`) y la propia pantalla cambia
  al momento a "aún no te has registrado", con el formulario de
  teléfono+PIN ya integrado para volver a entrar.

- **`/mi-ranking` reorganizado en 4 pestañas** (Resumen, Racha, Premios,
  Ranking) en vez de una sola página larga con scroll. En móvil, las
  pestañas viven en una **barra fija abajo con iconos** (patrón nativo
  tipo Instagram/Twitter); en pantallas grandes (sm+), se convierten en
  pestañas arriba, mismo estilo que ya usa `/dashboard`. Mismo estado,
  dos formas de mostrarlo según el tamaño de pantalla.
  - Nota: la pestaña se llama "Racha" a secas, no "Racha mensual" — la
    lógica sigue siendo semanal (objetivo por semana), así que
    "mensual" no encajaba con lo que hay dentro (aunque el calendario
    visualmente muestre el mes en curso).

- **Icono con fondo sólido.** El PNG del logo era transparente, así que
  tanto la app de Android como el splash de la PWA lo componían sobre
  blanco por defecto — se veía roto. Ahora hay una versión con fondo
  asphalt sólido horneado en el propio PNG (`public/brand/ryvo-icon-solid.png`),
  usada en el favicon y en el manifest (icono + `background_color` del
  splash, ahora oscuro). ⚠️ **La app de Android ya estaba compilada con
  el icono viejo** — hay que decirle a Claude Code que regenere los
  iconos de `android/` desde el manifest actualizado y vuelva a
  compilar con `bubblewrap build` para que se refleje ahí también.
- **Fuera el sistema de "qué has entrenado hoy".** Quitado por completo
  (selector en el fichaje, `recordMuscleGroup`, `getMuscleTally`,
  `MUSCLE_GROUPS` en `lib/types.ts`) — le daremos otro enfoque más
  adelante. La columna `muscle_group` se queda en la tabla `checkins`
  sin usarse, no hacía falta tocar el esquema para esto.
- **Calendario real en `/mi-ranking`**, estilo Strava — semanas como
  filas, días de la semana como columnas con su cabecera (L M X J V S
  D), número de día en cada casilla, y 🔥 en los días con sesión válida
  registrada. Antes era una cuadrícula genérica sin alinear a
  calendario de verdad.

- **Arreglado: se podían fichar varias sesiones válidas el mismo día.**
  Un socio que ya tuviera una sesión validada hoy podía volver a tocar
  el NFC y abrir otra sesión nueva, acumulando XP de más. Ahora, si ya
  hay una sesión válida hoy (`hasValidSessionToday`, en
  `lib/memberStore.ts`, basado en `ultimaSesion` — sin consultas
  extra), el tap de entrada muestra "Ya has fichado hoy" en vez de
  arrancar una sesión nueva. Cerrar una sesión ya abierta sigue
  funcionando igual, esto solo bloquea *empezar* una segunda.

- **`/.well-known/assetlinks.json`** — archivo de verificación de
  Digital Asset Links para la app de Android (TWA, generada con
  Bubblewrap desde Claude Code, proyecto en `android/` dentro del
  repo). Confirma a Android que la web (`ryvo-app-alpha.vercel.app`) y
  la app (`com.ryvo.app`) son del mismo dueño — sin esto, la app abre
  con la barra de navegador de Chrome visible en vez de a pantalla
  completa.
  - ⚠️ **Este archivo solo tiene efecto en producción.** La app
    Android se generó apuntando directamente a la URL de producción,
    no a la de preview — probarlo en `dev` no verifica nada útil esta
    vez.
  - El icono usado para la app (165×165) es más pequeño de lo que
    recomienda Google Play (512×512 mínimo) — vale para probar, pero
    habrá que regenerarlo con una versión de mayor resolución antes de
    publicar en la Play Store de verdad.

- **Logo real integrado.** Sustituidos el icono y el wordmark que
  habíamos dibujado a mano en SVG por los archivos reales
  (`public/brand/`). El icono ya venía a color (verde lima) y funciona
  en cualquier fondo; el wordmark original es un contorno claro pensado
  para fondo oscuro, así que generé una segunda versión oscura
  (`ryvo-text-dark.png`) para usarlo en las pantallas de fondo claro,
  que son casi todas ahora — `components/Logo.tsx` elige la variante
  correcta según la prop `tone`. Favicon y manifest de la PWA
  actualizados también con el icono real.
- ⚠️ Son imágenes PNG, no vectores — a tamaños muy grandes podrían
  perder nitidez. Si en algún momento tienes las versiones SVG/vector
  originales, sustituir estos PNG por SVG es una mejora sencilla.

- **La racha deja de ser cosa del gimnasio y pasa a ser 100% del
  socio.** Cada uno elige su propio objetivo semanal (1-6 días,
  `/mi-ranking`) en vez de que lo fije el CEO — se quitó por completo
  la sección "Racha semanal" del panel del CEO.
- **Congelador de racha.** Comprable con XP (250 por defecto, ver
  `STREAK_FREEZE_COST_XP` en `lib/types.ts`) — protege una semana floja
  sin perder la racha acumulada, igual que en Duolingo.
- **Calendario de actividad + logros** en `/mi-ranking` — una
  cuadrícula de las últimas 8 semanas marcando qué días entrenaste de
  verdad (datos reales de `checkins`), y una fila de logros por hitos
  de sesiones totales (10/25/50/100/200).
- Limpieza de código muerto: `lib/streakStore.ts`, los socios de
  ejemplo de `lib/mockData.ts` y el tipo `Checkin` sin usar — todos
  quedaron huérfanos tras la migración a Supabase y ya no hacían nada.

- **Horas valle configurables por gimnasio.** El CEO define un tramo
  horario y un bonus de XP (pestaña Premios → "Horas valle") para
  animar a los socios con horario flexible a venir en las horas menos
  concurridas — usa la propia gráfica de "Horas punta" del Resumen
  para decidir cuál es su franja floja. El socio ve el aviso en el
  momento de fichar entrada si está dentro del tramo, y el desglose
  del bonus al validar la salida. También aparece publicitado como
  cuarta ventaja en la landing (`/`). Ver `lib/offpeakStore.ts`.

- **Nueva pestaña "Resumen" en `/dashboard`, y es la primera que se ve.**
  Antes había que entrar en una pestaña concreta para saber si algo iba
  mal; ahora el CEO ve de un vistazo: socios activos, en riesgo, racha
  media, y sesiones de esta semana comparadas con la anterior (▲/▼ %).
  Debajo, dos gráficas nuevas: **sesiones por día** (últimos 14 días) y
  **horas punta** (0-23h, útil para decidir cuándo reforzar personal).
  Si hay socios en riesgo, aparece un aviso directo con botón para ir
  al Radar.
- **La gráfica de "Actividad mensual" deja de usar datos de ejemplo.**
  Desde que conectamos Supabase, esa gráfica seguía mostrando la lista
  fija de `lib/monthlyStats.ts` (que ya se ha eliminado) — ahora se
  calcula de verdad a partir de los fichajes reales de los últimos 6
  meses. Ver `lib/analyticsStore.ts` → `getGymAnalytics`.

- **Editar y borrar gimnasios desde `/admin`.** Antes solo se podían
  crear y ver. Ahora cada gimnasio de la lista tiene "Editar" (nombre y
  slug, en línea) y "Borrar" — con confirmación explícita, porque
  borrar un gimnasio arrastra también a todos sus socios, fichajes y
  premios (la base de datos lo hace en cascada). Ver `lib/gymStore.ts`
  → `updateGymIdentity` / `deleteGym`.

- **Panel de administrador (`/admin`)** — nuevo rol `admin`, pensado
  para ti como dueño de la plataforma, no para un gimnasio concreto.
  Desde ahí puedes crear gimnasios nuevos (nombre + slug, sin tocar el
  SQL Editor de Supabase) y ver los socios de cualquiera de ellos. Es
  el primer paso real hacia que Ryvo sea multi-gimnasio de verdad, no
  solo Box Rinconada.
- **Enlace desde `/login` hacia `/mi-ranking`.** Un socio real que
  llegue a `/login` por error (porque no sabe que su pantalla vive en
  otro sitio) ahora tiene un enlace claro: "¿Eres socio y quieres ver
  tu ranking? Entra aquí".

- **Acceso desde otro dispositivo (`/mi-ranking`).** Hasta ahora, un
  socio registrado por NFC solo podía ver su ranking desde el mismo
  móvil donde se registró — no había forma de consultarlo desde casa.
  Ahora el registro pide también un **PIN de 4 dígitos** (además del
  teléfono, que pasa a ser obligatorio), y con esos dos datos se puede
  "acceder" desde cualquier dispositivo nuevo sin volver a fichar. Ver
  `lib/memberStore.ts` → `loginWithPhonePin`.
  - ⚠️ El PIN se guarda sin cifrar, igual que las credenciales de
    `lib/auth.ts` — hay que hashearlo (o mover esto a Supabase Auth de
    verdad) antes de un piloto con socios reales.

- **Se quita el modo Monitor y el bonus de clase dirigida**, de momento.
  Incluía: la pantalla `/monitor` con PIN, el roster de "quién ha
  fichado hoy", y el bonus de XP que el monitor otorgaba a mano. Se
  puede recuperar más adelante si hace falta — de momento se saca del
  alcance para simplificar antes de conectar Supabase.
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
| TV | `tv` | `tv1234` | `/tv` |
| Admin (tú) | `admin` | `ryvoadmin2026` | `/admin` — gestión de todos los gimnasios |

Entra por `/login` (o desde la landing en `/`, botón "Ver la demo").

**Importante — esto es una capa de demo, no el flujo real de producción.**
El socio de verdad nunca ve un login: en producción sigue entrando solo
tocando el NFC, sin fricción. De hecho, `/checkin` y `/mi-ranking` ya
**no** exigen sesión — cualquiera puede tocar el NFC y registrarse sin
login, tal como está pensado el flujo real. El login de arriba solo
protege `/dashboard` y `/tv`, y sirve además para "entrar como" el
socio de prueba sin tener que fichar físicamente cada vez: al iniciar
sesión como `socio`, el sistema vincula tu navegador a Lucía Ferrer
usando el mismo mecanismo de identidad por dispositivo que ya usa el
fichaje real.

`/dashboard` y `/tv` están protegidos por `components/RequireRole.tsx`:
si no hay sesión, o el rol no coincide, redirige a `/login` sin mostrar
nada del contenido protegido de por medio.

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

- **Las 3 credenciales están en texto plano en `lib/auth.ts`.** Sirve para
  probar el flujo, pero antes de un piloto real esto tiene que ser
  Supabase Auth de verdad, con contraseñas hasheadas y roles en base de
  datos — nunca credenciales legibles en el código fuente.


## Los cinco flujos, separados por tipo de usuario

1. **Fichaje** (`/checkin?gym=<slug>`) — destino real del NFC/QR de
   entrada, sin login. Automático, sin app. Registro rápido de un paso
   la primera vez. Detecta sesiones abandonadas. Aviso GPS silencioso.
   Selector opcional de grupo muscular al salir.
2. **Mi ranking** (`/mi-ranking`) — sin login. Puesto, XP, escalera de
   premios, cashback, banner de "olvidé fichar" cuando aplica, y el
   ranking del gimnasio.
3. **Dashboard del dueño** (`/dashboard`) — requiere login (`ceo`). Cuatro
   pestañas: Radar de Riesgo (con aviso de anomalías GPS), Ranking,
   Actividad (gráfica de crecimiento relativo + desglose de grupos
   musculares), y Premios (editor de premios, cashback y racha semanal).
4. **Modo TV** (`/tv`) — requiere login (`tv`). Ranking en pantalla de sala, rotando con
   cartelería digital del gimnasio.
5. **Landing de venta** (`/`) — la cara pública del producto.

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

Abre `http://localhost:3000`. Te lleva a la landing — desde ahí, "Ver la
demo" te manda a `/login` con las 3 credenciales de prueba de arriba.

## Qué falta para que sea real (siguientes pasos)

1. **Conectar Supabase de verdad** (en marcha — ver más abajo).
   - Crea un proyecto gratuito en [supabase.com](https://supabase.com).
   - Ve a *SQL Editor* y ejecuta el contenido de `supabase/schema.sql` — crea
     las tablas `gyms`, `members`, `checkins`, `rewards` y la vista
     `member_activity`.
   - Copia `.env.example` a `.env.local` y rellena las dos variables con los
     valores de tu proyecto (*Project Settings → API*).
   - Sustituir `lib/memberStore.ts`, `lib/rewardsStore.ts`,
     `lib/cashbackStore.ts` y `lib/streakStore.ts` (todo lo que hoy lee/escribe
     localStorage) por llamadas reales a `lib/supabase.ts`.

2. **Fuentes de marca reales.** El wordmark "Ryvo" ya usa Bebas Neue de
   verdad (vía `@fontsource`, funciona sin depender de Google Fonts). El
   resto de la interfaz (`font-display`, `font-sans`) sigue en fuentes de
   sistema como fallback — el código para restaurar Oswald + Inter + IBM
   Plex Mono está comentado en `app/layout.tsx`.

3. **NFC real.** Cuando tengas los tags NFC, la URL que graben debe apuntar
   a `/checkin?gym=<slug-del-gimnasio>&token=<token-secreto>` — ahora mismo
   el `token` no se valida todavía (es lo primero que hay que añadir antes
   de dar el sistema por seguro frente a fraude básico).

## ¿Estamos conectando Supabase ahora mismo?

Si estás leyendo esto durante esa migración: la lógica de negocio de cada
store (`memberStore.ts`, `rewardsStore.ts`, `cashbackStore.ts`,
`streakStore.ts`) está escrita para que la parte de *arriba* (cálculo de
racha, riesgo, cashback) no tenga que cambiar — solo cambia *de dónde*
vienen y *a dónde* van los datos (Supabase en vez de `localStorage`).

## Estructura del proyecto

```
app/
  page.tsx              → landing de venta (pública, explica el producto)
  login/page.tsx          → login de demo (3 credenciales)
  app/page.tsx              → router por tipo de usuario, filtrado por rol
  checkin/page.tsx            → fichaje automático + registro (sin login)
  mi-ranking/page.tsx          → ranking personal + premios + cashback (sin login)
  dashboard/page.tsx            → Radar de Riesgo + Ranking + Actividad + Premios (ceo)
  tv/page.tsx                     → pantalla de sala, modo kiosko (tv)
components/
  RegisterForm.tsx        → registro rápido de 1 paso (solo primera vez)
  MemberRiskRow.tsx        → fila de socio con su nivel de riesgo
  RewardsEditor.tsx         → editor de premios, cashback y racha (ceo)
  RequireRole.tsx            → guarda de acceso por rol
  Logo.tsx                    → wordmark + icono de la marca
lib/
  types.ts                 → lógica de negocio: computeRisk(), REWARDS, tipos
  mockData.ts               → socios de ejemplo (Box Rinconada) + GYM_ID
  monthlyStats.ts            → datos de ejemplo para las gráficas mensuales
  memberStore.ts               → "backend" simulado en localStorage: registro,
                                 XP, racha semanal, ranking
  rewardsStore.ts                → premios por gimnasio
  cashbackStore.ts                → regla de cashback por gimnasio
  streakStore.ts                   → mínimo de sesiones/semana por gimnasio
  auth.ts                            → login de demo (3 roles)
  supabase.ts                         → cliente de Supabase (listo para cuando conectes)
supabase/
  schema.sql                            → esquema completo para pegar en el SQL Editor
```

## Siguiendo en Claude Code

Este proyecto está pensado para continuar en Claude Code desde aquí. Una
buena primera tarea para darle sería:

> "Conecta este proyecto a mi proyecto de Supabase (las credenciales están
> en .env.local) y sustituye los datos simulados de mockData.ts por
> consultas reales a las tablas del esquema, manteniendo la misma lógica de
> computeRisk()."
