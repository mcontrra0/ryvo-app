# Ryvo — MVP (racha semanal, no diaria)

## Qué cambió en esta vuelta

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
