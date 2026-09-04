import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playSparkle, playVoiceClip } from "../audio/audioEngine";
import { useConfetti } from "../effects/useConfetti";
import { useProgressStore } from "../store/progressStore";
import { pickRandom } from "../utils/random";

/** Espera antes de la voz de bienvenida: da tiempo a que la pantalla entre y el niño la mire. */
const WELCOME_DELAY_MS = 500;

/**
 * Cuántos aciertos (celebrate) forman una "ronda" antes de mostrar la
 * pantalla de logro (ver LevelCompleteOverlay). Sin esto cada nivel era un
 * ejercicio infinito, sin principio ni fin — el niño nunca sentía que
 * "terminó" algo. 5 es corto para su atención (unos 15-30s de juego real)
 * sin sentirse apurado ni evaluado: siempre se completa, nunca se falla.
 */
const DEFAULT_ROUND_SIZE = 5;

/**
 * Voz cálida al equivocarse — nunca de decepción, nunca "no". Antes, un
 * error solo se sacudía en silencio (o sonaba igual que un toque
 * cualquiera): ahora el niño escucha que se le anima a seguir intentando,
 * la misma idea de "elogio de proceso" (docs/CURRICULUM.md §7) aplicada
 * también al intento fallido, no solo al acierto.
 */
const ENCOURAGE_FILES: [string, ...string[]] = [
  "encourage-1.mp3",
  "encourage-2.mp3",
  "encourage-3.mp3",
  "encourage-4.mp3",
];
/** Evita que toques equivocados muy seguidos atropellen la voz anterior. */
const ENCOURAGE_COOLDOWN_MS = 1200;

interface GameSessionOptions {
  locale: string;
  /** Clip de voz que da la consigna al entrar, p. ej. "n3-welcome.mp3". */
  welcomeFile: string;
  /** Ver DEFAULT_ROUND_SIZE. Ajustable por si un nivel necesita otro ritmo. */
  roundSize?: number;
}

/**
 * Ciclo de vida común a todos los niveles: registra la sesión en el
 * progreso, da la consigna hablada al entrar, y expone una única forma de
 * celebrar un acierto.
 *
 * `celebrate(event)` concentra la retroalimentación positiva (tono +
 * confeti en el punto tocado + salto del compañero perruno) para que
 * cada nivel nuevo la obtenga igual, sin re-implementarla: ver
 * docs/CURRICULUM.md §2 — el refuerzo es siempre el mismo, lo que cambia
 * es el reto.
 */
export function useGameSession(
  levelId: string,
  { locale, welcomeFile, roundSize = DEFAULT_ROUND_SIZE }: GameSessionOptions,
) {
  const [celebrateSignal, setCelebrateSignal] = useState(0);
  // Solo se lee dentro de su propio updater funcional (ver celebrate): no
  // necesita re-renderizar nada por sí solo, de ahí que no se desestructure el getter.
  const [, setStreak] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const recordPlay = useProgressStore((state) => state.recordPlay);
  const recordRoundComplete = useProgressStore((state) => state.recordRoundComplete);
  const { burst, confettiField } = useConfetti();
  const lastEncourageAt = useRef(0);

  useEffect(() => {
    recordPlay(levelId);
    const timer = setTimeout(() => playVoiceClip(locale, welcomeFile), WELCOME_DELAY_MS);
    return () => clearTimeout(timer);
    // Solo al montar: la consigna de bienvenida no debe repetirse si cambia el idioma a media partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Acusa recibo de un toque NEUTRAL que no es un acierto ni un error real
   * (p. ej. seleccionar la primera carta de un par, o tocar mientras el
   * personaje "baila" en N8): el niño necesita saber que la app lo
   * escuchó. Para un error real (una respuesta equivocada), usar
   * `encourage()` en su lugar — ese sí lleva voz.
   */
  const acknowledgeTap = useCallback(() => {
    playChime();
  }, []);

  /**
   * Celebra un acierto. Recibe el evento del toque para lanzar el confeti
   * justo donde el niño tocó (la causa y el efecto deben coincidir en el
   * espacio para que el vínculo sea evidente a esta edad).
   */
  const celebrate = useCallback(
    (event?: { clientX: number; clientY: number }) => {
      // Toque simple = pop; acierto = pop + arpegio ("¡lo lograste!"), para
      // que el logro suene claramente distinto de un toque cualquiera.
      playChime();
      playSparkle();
      if (event) burst(event.clientX, event.clientY);
      setCelebrateSignal((n) => n + 1);
      setStreak((s) => {
        const next = s + 1;
        if (next >= roundSize) {
          recordRoundComplete(levelId);
          setRoundComplete(true);
          return 0;
        }
        return next;
      });
    },
    [burst, roundSize, levelId, recordRoundComplete],
  );

  /** Cierra la pantalla de logro y sigue jugando: el juego de fondo no se
   * reinicia, solo estaba en pausa (ver GameShell/LevelCompleteOverlay). */
  const continueRound = useCallback(() => setRoundComplete(false), []);

  /**
   * Responde a una respuesta equivocada con calidez: una voz que anima a
   * seguir intentando (nunca un "no", nunca un sonido negativo). Se llama
   * en el momento del error real (p. ej. dos cartas que no combinan), no
   * en un toque neutral intermedio (para eso sigue existiendo acknowledgeTap).
   */
  const encourage = useCallback(() => {
    const now = Date.now();
    if (now - lastEncourageAt.current < ENCOURAGE_COOLDOWN_MS) return;
    lastEncourageAt.current = now;
    playVoiceClip(locale, pickRandom(ENCOURAGE_FILES));
  }, [locale]);

  return { acknowledgeTap, celebrate, encourage, celebrateSignal, confettiField, roundComplete, continueRound };
}
