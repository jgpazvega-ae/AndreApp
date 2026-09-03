# Plan de construcción — AndreApp

> App educativa de juegos para niños de **2 a 5 años**, inspirada en *Juegos para niños & niñas 2-5* de Bimi Boo.
> Este documento es el plan de producto y técnico. **Todavía no incluye código de la app** — es la base para decidir y arrancar.

---

## 1. Visión del producto

Una app **offline, sin anuncios y sin texto que el niño tenga que leer**, con mini-juegos cortos que enseñan conceptos básicos (números, colores, formas, animales, letras) mediante toque, arrastre y trazado, con **instrucciones y refuerzo por voz en español**.

El objetivo no es solo copiar la app de referencia, sino tomar lo que hace bien y corregir su punto débil (paywall muy temprano):

**Qué imitamos de la referencia**
- Trazado guiado de números con el dedo + retroalimentación por voz.
- Un personaje/animalito que acompaña y refuerza cada concepto.
- Progresión simple y cero fricción (nada de menús ni texto).
- Sin anuncios intrusivos.

**Qué mejoramos**
- Nada de paywall temprano: MVP 100% jugable (es una app personal para Andre; monetización queda como opción futura).
- Más variedad desde el inicio (no solo números): colores, animales, formas.
- Refuerzo positivo total: **nunca se penaliza el error**, solo se celebra el acierto.

---

## 2. Público objetivo y principios de diseño

**Usuario:** niño/a de 2-5 años, que aún no lee, con motricidad fina en desarrollo. **Usuario secundario:** el papá/mamá que configura y supervisa.

Principios de UX para esta edad (reglas duras del diseño):

| Principio | Implicación concreta |
|---|---|
| Sin lectura | Toda instrucción es por **voz + íconos**. Nada de texto para el niño. |
| Botones grandes | Áreas táctiles mínimas de ~60-72 px; mucho espacio entre elementos. |
| Gestos simples | Solo **tocar** y **arrastrar lento**. Nada de doble-tap, swipe preciso o pellizco. |
| Sin castigo | El error no da sonido negativo ni bloquea; se repite la pista con suavidad. |
| Refuerzo constante | Acierto = sonido alegre + animación + estrella/aplauso. |
| Sesiones cortas | Rondas de 30-90 s; sin cronómetros ni presión de tiempo. |
| Zona de padres protegida | Ajustes y cualquier enlace externo detrás de un **candado** (p. ej. "mantén pulsado 3 s" o resolver una suma) — estándar para apps infantiles. |
| Privacidad primero | Sin cuentas, sin recolección de datos, sin enlaces salientes accesibles al niño, **todo local**. |

---

## 3. Alcance — catálogo de mini-juegos

Cada juego es un módulo independiente que comparte el mismo motor de audio, refuerzo y navegación.

### MVP (Fase 1) — 3 juegos

1. **Números (1-10)**
   - Modo *contar*: aparecen N objetos, el niño toca el número correcto (o al revés).
   - Modo *trazar*: sigue con el dedo el trazo del número; la app lee el número en voz alta.
2. **Colores**
   - Aparece un color y varios objetos; toca el que corresponde. La app nombra el color.
3. **Animales y sonidos**
   - Toca el animal → escucha su nombre y su sonido. Variante: "¿dónde está el perro?".

### Backlog (Fase 2+)

4. **Formas** — círculo, cuadrado, triángulo, estrella (emparejar / meter la pieza en el hueco).
5. **Memorama** — emparejar cartas iguales (2-6 pares según edad).
6. **Letras / abecedario** — reconocer la letra y su sonido.
7. **Rompecabezas simple** — arrastrar 2-6 piezas a su lugar.
8. **Números 11-20** — extensión del módulo de números.

---

## 4. Stack tecnológico (propuesta)

**Recomendación: Expo (React Native) + TypeScript.**

Razones:
- **Multiplataforma** (iOS y Android) con un solo código — la referencia es iOS, pero así Andre puede usarla en cualquier tablet.
- **Preview inmediato** en un dispositivo real con Expo Go durante el desarrollo (sin necesidad de Mac/Xcode para probar).
- Ecosistema maduro para justo lo que necesita esta app: audio, gestos, animaciones y dibujo.
- Camino claro a publicar en App Store / Google Play más adelante (EAS Build) si se quiere.

Librerías clave:

| Necesidad | Librería |
|---|---|
| Navegación | Expo Router |
| Audio (voz + efectos + música) | `expo-audio` |
| Gestos y arrastre | `react-native-gesture-handler` |
| Trazado de números (dibujo fluido) | `@shopify/react-native-skia` |
| Animaciones | `react-native-reanimated` + **Lottie** (`lottie-react-native`) para personajes |
| Estado y progreso | `zustand` + `@react-native-async-storage/async-storage` |
| Multi-idioma (a futuro) | `i18n-js` o `expo-localization` |

**Sin backend** en el MVP: todo funciona offline y el progreso se guarda local. Esto es lo mejor para privacidad infantil y para que funcione sin internet.

**Alternativas consideradas** (por si prefieres otra ruta — es una decisión abierta, ver §11):
- *Flutter* — excelente para animaciones/juegos, un solo código; buena opción si ya conoces Dart.
- *Web / PWA (React + Vite)* — el preview más rápido y sin tiendas; se puede envolver luego con Capacitor. Ideal si quieres probar la idea en el navegador de una tablet hoy mismo.
- *Nativo iOS (SwiftUI)* — máxima fluidez y "sensación iOS" como la referencia, pero un solo sistema y requiere Mac + Xcode + cuenta de desarrollador.

---

## 5. Arquitectura y estructura del repo

Motor compartido + juegos como módulos enchufables:

```
AndreApp/
├─ app/                      # rutas (Expo Router): inicio, /game/[id], zona-padres
├─ src/
│  ├─ core/
│  │  ├─ audio/              # reproducción de voz, efectos y música
│  │  ├─ reward/             # sistema de refuerzo (estrellas, aplausos, animaciones)
│  │  ├─ progress/           # store zustand + persistencia
│  │  └─ ui/                 # botones grandes, contenedores, tipografía kid-friendly
│  ├─ games/
│  │  ├─ numbers/
│  │  ├─ colors/
│  │  └─ animals/
│  └─ content/               # catálogo de items (número→voz/imagen, color→..., animal→...)
├─ assets/
│  ├─ audio/                 # voces (es), efectos, música
│  ├─ images/                # ilustraciones, íconos
│  └─ lottie/                # animaciones de personajes
└─ PLAN.md
```

Contrato común de un juego (para que todos se integren igual):
- Recibe: catálogo de contenido + callbacks de refuerzo/progreso.
- Expone: una ronda jugable, eventos de acierto/intento, y "completado".
- Reglas compartidas: sin texto, audio-first, sin castigo, botones grandes.

---

## 6. Plan de contenido y assets

Esta suele ser la parte que más trabajo lleva en una app infantil. Necesitamos:

- **Voz en español** (instrucciones, nombres de números/colores/animales, frases de ánimo). Se puede generar con **texto-a-voz** (tengo herramientas de ElevenLabs disponibles en esta sesión) o grabar una voz humana. Recomiendo TTS para el MVP y valorar voz humana después.
- **Ilustraciones e íconos** (personaje guía, objetos para contar, animales). Opciones: generar con IA, packs con licencia adecuada, o ilustración propia.
- **Animaciones Lottie** para el personaje y las celebraciones.
- **Efectos de sonido** (acierto, estrella, aplausos) y **música** de fondo suave (con opción de silenciar).

⚠️ **Licencias:** todo asset debe tener licencia clara para uso comercial/personal. No usar material con copyright de terceros. Definir esto antes de la Fase 1.

---

## 7. Fases y hitos

| Fase | Entregable | Contenido |
|---|---|---|
| **0 — Fundaciones** | App corre y navega | Proyecto Expo, navegación, sistema de audio, componentes UI kid-friendly, store de progreso, pantalla de inicio con selector de juegos. |
| **1 — MVP jugable** | 3 juegos + voz es | Números (contar+trazar), Colores, Animales. Refuerzo positivo, estrellas, zona de padres con candado. Offline. |
| **2 — Ampliación** | +Juegos y progreso | Formas, Memorama, Letras; sistema de progreso/recompensas más rico; ajustes (volumen, idioma). |
| **3 — Pulido / publicación** | Listo para tienda (opcional) | Animaciones y música pulidas, control parental, íconos/splash, build EAS, y (si se decide) publicación en App Store / Google Play. |

Sugerencia: cerrar Fase 0 + Fase 1 primero y ponerla en manos de Andre para ver qué le engancha antes de invertir en la Fase 2.

---

## 8. Consideraciones legales y de privacidad

- **Sin recolección de datos** en el MVP (nada de analytics ni identificadores). Es lo más limpio para una app infantil y evita requisitos de COPPA/GDPR-K.
- Si algún día se publica: cumplir con la sección **Kids** de App Store y **Designed for Families** de Google Play (sin publicidad de comportamiento, zona de padres, política de privacidad).
- Cualquier enlace externo (tienda, redes, "más apps") **solo** detrás de la zona de padres.

---

## 9. Monetización (opcional, a futuro)

Como es una app personal para Andre, el MVP no la necesita. Si se quisiera publicar, la mejor jugada frente a la referencia sería: **más contenido gratis** y, si acaso, una única compra desbloqueable — evitando el paywall temprano que critican en las reseñas.

---

## 10. Métricas de éxito

Para una app personal, la métrica real es simple: **¿Andre la disfruta y aprende?** En concreto:
- Vuelve a abrirla por gusto.
- Completa rondas sin frustrarse (sin castigo, todo celebra).
- Empieza a reconocer números/colores/animales fuera de la app.

---

## 11. Decisiones abiertas (para confirmar antes de arrancar)

1. **Stack:** ¿confirmamos **Expo/React Native**, o prefieres **web/PWA** (preview hoy mismo en el navegador) o **nativo iOS**?
2. **Idioma:** ¿solo **español** en el MVP, o español + inglés desde el inicio?
3. **Voz:** ¿**TTS** (la genero yo) o grabación de voz humana?
4. **Arte:** ¿generamos ilustraciones/personaje con IA, o tienes un estilo/assets en mente?
5. **Nombre del personaje guía:** ¿un animalito que acompañe a Andre? (ayuda a dar identidad a la app).

---

## 12. Siguiente paso propuesto

Confirmar las decisiones de §11 (sobre todo el **stack** y el **idioma**) y arrancar la **Fase 0**: dejar el proyecto corriendo con la pantalla de inicio y el primer juego de **Números**.
