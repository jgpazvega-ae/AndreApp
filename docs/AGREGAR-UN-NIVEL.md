# Cómo agregar un nivel

Quedan 17 de los 22 niveles del [mapa curricular](CURRICULUM.md). Esta guía
existe para que construirlos sea repetir un procedimiento, no reinventar la
pantalla cada vez — y para que el niño encuentre siempre la salida, la
celebración y el compañero en el mismo lugar.

## 1. La mecánica va en un archivo, el resto ya está resuelto

```tsx
// apps/web/src/games/n6/N6Rompecabezas.tsx
import { GameShell } from "../../components/GameShell";
import { useGameSession } from "../useGameSession";

export function N6Rompecabezas({ locale, onExit }: { locale: string; onExit: () => void }) {
  const { celebrate, celebrateSignal, confettiField } = useGameSession("n6", {
    locale,
    welcomeFile: "n6-welcome.mp3",
  });

  return (
    <GameShell
      levelId="n6"
      onExit={onExit}
      background="linear-gradient(160deg, #E8F7FF 0%, #A8E6CF 100%)"
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
    >
      {/* Solo la mecánica del nivel */}
    </GameShell>
  );
}
```

`GameShell` pone el fondo, la decoración, el botón de regresar (traducido),
el confeti y el perrito compañero. `useGameSession` registra la sesión en el
progreso, da la consigna hablada al entrar y expone:

| Función            | Cuándo usarla                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| `celebrate(event)` | El niño **acertó**: tono + confeti donde tocó + salto del compañero.        |
| `acknowledgeTap()` | Un toque que **no** es acierto (una selección intermedia, una equivocación). |

Nunca se reproduce un sonido de error: el "no" se comunica solo en imagen
(una sacudida), según [CURRICULUM.md §2](CURRICULUM.md).

Para el andamiaje por inactividad hay `useIdleHint()`, que devuelve `idle`
tras unos segundos sin toques para hacer la consigna más evidente.

## 2. Registrar el nivel

1. En `packages/curriculum/src/levels.ts`, cambiar su `status` a `"playable"`.
2. En `apps/web/src/games/registry.tsx`, agregarlo a `GAME_REGISTRY`.

Las pruebas verifican que ambos pasos vayan juntos: un nivel jugable sin
juego, o un juego que nadie puede abrir, hacen fallar `npm test`.

## 3. Voces y textos

- Los clips se generan con ElevenLabs (ver [`scripts/gen-voices/README.md`](../scripts/gen-voices/README.md))
  y se guardan en `apps/web/public/audio/<locale>/`.
- Cada clip nuevo se anota en `packages/i18n/src/voiceManifests/`, con
  `reviewed: false` hasta que una persona lo escuche (PLAN.md §7).
- Toda etiqueta de accesibilidad (`aria-label`) va traducida en los **tres**
  idiomas. Hay una prueba que falla si un idioma se queda atrás.

## 4. Antes de subir

```bash
npm run check      # lint + tipos + pruebas
npm run test:e2e   # el recorrido completo en iPhone emulado
```

Conviene añadir el nivel nuevo a `PLAYABLE_LEVELS` en
`apps/web/e2e/anico.spec.ts`: con una línea queda cubierto por todo el
recorrido (abre, responde al toque, regresa sin errores de consola).
