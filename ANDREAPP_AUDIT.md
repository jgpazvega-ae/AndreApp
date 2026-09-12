# ANDRÉAPP — AUDITORÍA FORENSE

Fecha: 2026-09-10. Rama: `claude/kids-games-app-analysis-cmxv5r` (PR #1, sin mergear a `main`).

Este documento existe porque un directriz de producto pidió explícitamente
un `ANDREAPP_AUDIT.md` antes de seguir construyendo. No es una foto de un
proyecto sin tocar: las últimas horas de trabajo en esta rama ya avanzaron
buena parte de lo que un FASE 0 normalmente encontraría por hacer (navegación
por pilares, motor de escenas Explorar, metadata pedagógica). Esta auditoría
documenta el estado **real** tal como quedó, con autocrítica honesta, no un
resumen de logros.

## 1. Qué es AndréApp hoy

PWA educativa 0-5 años, monorepo npm workspaces (`apps/web` + `packages/curriculum,i18n,shared`),
React 18 + Vite 6 + TypeScript estricto (`noUncheckedIndexedAccess`). Sin backend: todo el
progreso vive en IndexedDB (Zustand + localforage), offline-first vía Service Worker (Workbox).

**Lo que un niño puede hacer:** elegir un compañero perruno (Odie/Dante/Kira, arte propio
pintado), entrar por 4 pilares — **Jugar** (13 niveles jugables en cuadrícula plana),
**Aprender** (los mismos 13 niveles agrupados en 3 mundos narrativos: Estación/Bosque/Océano),
**Explorar** (una escena libre, "Parque", con 10 objetos tocables sin meta) y **Favoritos**
(niveles/escenas marcados con corazón) — y jugar sin necesitar leer nada (voces es-MX,
íconos redundantes, sin estados de fallo).

**Lo que un padre puede hacer:** entrar a Zona de Padres (mantener presionado 3s), cambiar
idioma (es-MX/en/pt-BR — solo es-MX tiene voces), activar modo calma (reduce movimiento),
ver progreso por nivel y un resumen no evaluativo de "habilidades practicadas hoy".

## 2. Fortalezas reales

- **Disciplina de pruebas de verdad**: 56 pruebas unitarias (Vitest) + 41 e2e (Playwright,
  emulando iPhone 13, contra el build de producción) + `tsc --noEmit` estricto + ESLint. No
  es teatro — han atrapado bugs reales durante esta misma sesión (ver §7).
- **Filosofía no punitiva ya implementada de punta a punta**: sin sonido de error, sin
  pantalla de fallo, elogio de proceso (siempre 3 estrellas), ayuda visual al equivocarse.
  No es una aspiración del documento de producto — ya es así en los 13 niveles.
- **Motor de audio sintetizado**: `playChime`/`playSparkle`/`playExploreSound` con Web Audio
  puro, cero archivos nuevos que generar o revisar. Reduce drásticamente el costo de agregar
  una reacción nueva.
- **Motor Explorar data-driven con interacciones emergentes**: `ExplorationScene` +
  `InteractiveObject` + `ExplorationSceneConfig` — una escena nueva es un archivo de config,
  no componentes nuevos. Incluye cadenas objeto→objeto (`chainTargetId`) y objeto→compañero
  (`notifiesBuddy`), que es la pieza que hace que el Parque se sienta mundo y no cuadrícula.
- **`GameShell`/`useGameSession`/`useTimers`/`useIdleHint`**: cada nivel nuevo reutiliza fondo,
  botón de salida, confeti, compañero, y el ciclo de "ronda" (5 aciertos → logro) sin
  reimplementarlo.
- **i18n con paridad forzada por prueba**: `i18n.test.ts` falla si un idioma se queda atrás
  en una sola clave — no es opcional, es CI.

## 3. Debilidades y problemas, clasificados

### P0 — Bloqueadores

Ninguno identificado. El build pasa, el deploy a GitHub Pages funciona, no hay pantallas
rotas ni errores de consola en el recorrido completo (verificado por la propia suite e2e).

### P1 — Crítico

1. ~~`npm run check` no corre `format:check`.~~ **Corregido** (commit `6fe263e`): ahora
   replica el orden exacto de `.github/workflows/ci.yml`.
2. ~~No existe dificultad adaptativa en ningún nivel.~~ **Corregido**: `progressStore` trackea
   `difficultyLevel`/`easyStreak`/`struggleStreak` por nivel (lógica pura y probada en
   `adaptiveDifficulty.ts`, 8 pruebas), `useGameSession` lo actualiza en cada `celebrate()`/
   `encourage()` y lo expone; N6 ya lo consume (`piecesForRound(roundIndex, difficultyLevel)`
   adelanta o atrasa el inicio del siguiente rompecabezas según desempeño real, nunca solo por
   completar una pantalla — sube despacio, baja rápido). Queda como trabajo futuro conectar el
   mismo `difficultyLevel` en los demás niveles con progresión fija (N4 y los que se agreguen).
3. ~~Inconsistencia visual de "profundidad" en el arte de Explorar.~~ **Corregido** (mismo commit
   `6fe263e`): los 10 objetos del Parque comparten degradados radiales.

### P2 — Importante

4. **El pilar "Aprender" y "Jugar" muestran el mismo catálogo de 13 niveles con dos
   agrupaciones distintas.** Funciona, pero un niño que ya exploró "Jugar" no gana nada
   nuevo al entrar a "Aprender" salvo la agrupación por mundo. No es un problema urgente,
   pero es una duplicación conceptual que vale la pena resolver cuando existan actividades
   verdaderamente distintas por pilar (p. ej. Aprender con series de dificultad progresiva
   reales, Jugar con sesiones cortas de causa-efecto).
5. **Solo una escena Explorar construida (Parque).** Estación/Océano/Ciudad/Casa/Espacio
   están en el selector marcadas "muy pronto" — comunicación honesta, pero es la limitación
   más visible del pilar que el propio producto llama diferenciador.
6. **Zona de Padres es funcional pero mínima frente a la ambición de "Crecer" del documento**
   (barras de progreso por habilidad, recomendaciones, tiempo de sesión). Hoy: idioma, modo
   calma, "hoy practicó" (lista de skills), lista de niveles jugados. No hay tendencia en el
   tiempo ni recomendaciones.
7. **Bundle único de 508 KB (154 KB gzip)** — Vite avisa del tamaño en cada build. No es
   crítico para un catálogo de 13 niveles + 1 escena, pero si Explorar crece a 5-6 escenas
   sin code-splitting por ruta, empezará a costar en tiempo de carga inicial en tablets de
   gama media (FASE 12 de este documento).

### P3 — Mejora

8. Sin dark mode / alto contraste explícito más allá de la paleta cálida base.
9. Sin telemetría de "descubrimientos" visible al padre (se registra en `progressStore.discoveries`
   pero no se muestra en ningún lado todavía — la base ya existe, falta la UI).
10. `docs/AGREGAR-UN-NIVEL.md` no tiene equivalente "cómo agregar una escena Explorar" —
    el conocimiento de cómo extender el motor vive solo en los comentarios del código.

## 4. Arquitectura actual (resumen técnico)

```
App.tsx (máquina de estados de pantalla, con "from" para volver exactamente
         a donde se abrió cada nivel/escena — no siempre al hub)
├── HomeScreen        → hub: buddy picker + 4 botones de pilar
├── JugarScreen        → cuadrícula plana de niveles jugables
├── AprenderScreen     → mapa de 3 mundos → WorldScreen → nivel
├── ExploreHubScreen   → selector de escenas Explorar
│   └── ExplorationScene → InteractiveObject × N (data-driven)
├── FavoritosScreen
├── ParentZoneScreen
└── games/n1..n13      → un componente por nivel, todos sobre GameShell
```

Estado: Zustand (`progressStore`) persistido en IndexedDB. Sin backend, sin cuentas, sin PII —
ya cumple FASE 15 (safety) en lo esencial: sin ads, sin chat, sin compras, zona de padres
separada por gesto de 3s que un niño pequeño no cruza por accidente.

## 5. Arquitectura recomendada (próximos pasos, no todos a la vez)

1. Agregar `format:check` a `npm run check` (5 minutos, elimina el P1 #1 de raíz).
2. Corregir la inconsistencia visual del arte de Parque (P1 #3) — este ciclo.
3. Diseñar el modelo de dificultad adaptativa como una extensión de `useGameSession`
   (streak/tasa de éxito ya se trackean parcialmente vía `roundsCompleted`), no un sistema
   paralelo.
4. Cuando se construya la segunda escena Explorar, verificar que NO haga falta duplicar
   código de `ExplorationScene`/`InteractiveObject` — si hace falta, ahí sí refactorizar
   antes de seguir (es literalmente el Quality Gate de FASE 2 de este documento).

## 6. Riesgos

- **Alcance del documento de producto vs. capacidad real de un ciclo de trabajo.** El
  directriz pide 20 fases con QA extremo en cada una. Intentar "completar" todas en una sola
  sesión produciría exactamente lo que el propio documento prohíbe: declarar victoria por
  cumplimiento, no por calidad. Este audit fija el criterio: se avanza fase por fase, con
  gate real, no por longitud de la lista de tareas.
- **Deriva de nombres entre versiones del documento de producto** (p. ej. el 4º pilar se
  pidió como "Favoritos" en una versión y "Crecer" en otra). Ya está señalado en el historial
  de esta rama; no se resuelve solo — es una decisión de producto pendiente.

## 7. Evidencia (no anecdótica)

- CI real detectó un fallo de formato que el proceso local no cubría (`68c27ab`, corregido
  en `a26f327`) — demuestra que el pipeline de calidad SÍ está siendo puesto a prueba, no
  solo declarado.
- 41/41 pruebas e2e y 56/56 unitarias pasando en el estado actual de esta rama.
- Captura de pantalla del Parque con 10 objetos y la cadena pelota→compañero verificada
  visualmente en este mismo ciclo de trabajo (no solo por prueba automatizada).

## 8. Prioridades para ESTE ciclo (Quality Gate, no expansión)

Antes de tocar FASE 4 en adelante, este ciclo corrige P1 #1 y P1 #3 — los dos hallazgos
reales de la autocrítica que son rápidos, acotados, y mejoran directamente la calidad visual
y de proceso sin ampliar alcance. Ver `PHASE REPORT` al final de la respuesta de esta sesión
para el resultado y el veredicto del Quality Gate.
