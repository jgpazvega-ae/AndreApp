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
 * El confeti del último acierto estalla en el mismo instante en que se
 * cierra la ronda; sin este respiro, la pantalla de logro (fondo oscuro +
 * blur) lo tapa antes de que el niño llegue a verlo — el premio grande
 * "gana" al premio chico en vez de continuarlo. Este retraso deja que el
 * confeti se vea primero (principio de puesta en escena/staging).
 */
const ROUND_COMPLETE_REVEAL_DELAY_MS = 450;

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
  /**
   * Clip de voz que da la consigna al entrar, p. ej. "n3-welcome.mp3".
   * Opcional: un juego autoexplicativo por diseño (la biblioteca de Jugar,
   * Product Vision §11 — "no depender de instrucciones") puede omitirlo.
   */
  welcomeFile?: string;
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
  // Nunca dispara un re-render por sí solo (setRoundComplete/setCelebrateSignal
  // ya lo hacen): vive en un ref para que `celebrate` pueda leer y decidir el
  // resultado en la misma llamada, sin esperar al siguiente render.
  const streakRef = useRef(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const recordPlay = useProgressStore((state) => state.recordPlay);
  const recordRoundComplete = useProgressStore((state) => state.recordRoundComplete);
  const recordAttemptOutcome = useProgressStore((state) => state.recordAttemptOutcome);
  const difficultyLevel = useProgressStore((state) => state.levels[levelId]?.difficultyLevel ?? 1);
  const { burst, confettiField } = useConfetti();
  const lastEncourageAt = useRef(0);
  const roundCompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    recordPlay(levelId);
    if (!welcomeFile) return;
    const timer = setTimeout(() => playVoiceClip(locale, welcomeFile), WELCOME_DELAY_MS);
    return () => clearTimeout(timer);
    // Solo al montar: la consigna de bienvenida no debe repetirse si cambia el idioma a media partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (roundCompleteTimer.current) clearTimeout(roundCompleteTimer.current);
    },
    [],
  );

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
   *
   * Devuelve `true` cuando ESTE acierto fue el que cerró la ronda (para que
   * un nivel con su propio elogio de "mini-ronda" local — p. ej. un par en
   * N3, un rompecabezas en N6 — pueda omitirlo justo en el toque en el que
   * coincide con el cierre de ronda compartido: si no, se oyen dos voces de
   * elogio distintas al mismo tiempo). La mayoría de los niveles no
   * necesitan este valor y simplemente lo ignoran.
   */
  const celebrate = useCallback(
    (event?: { clientX: number; clientY: number }): boolean => {
      // Toque simple = pop; acierto = pop + arpegio ("¡lo lograste!"), para
      // que el logro suene claramente distinto de un toque cualquiera.
      playChime();
      playSparkle();
      if (event) burst(event.clientX, event.clientY);
      setCelebrateSignal((n) => n + 1);
      recordAttemptOutcome(levelId, true);

      const next = streakRef.current + 1;
      if (next >= roundSize) {
        streakRef.current = 0;
        recordRoundComplete(levelId);
        // El valor de retorno (para que el nivel suprima su propio elogio
        // local) sigue siendo síncrono; solo la REVELACIÓN visual del logro
        // espera, para no tapar el confeti que acaba de estallar.
        if (roundCompleteTimer.current) clearTimeout(roundCompleteTimer.current);
        roundCompleteTimer.current = setTimeout(() => setRoundComplete(true), ROUND_COMPLETE_REVEAL_DELAY_MS);
        return true;
      }
      streakRef.current = next;
      return false;
    },
    [burst, roundSize, levelId, recordRoundComplete, recordAttemptOutcome],
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
    // El mismo cooldown que evita atropellar la voz también evita que un
    // manoteo de toques equivocados cuente como varios intentos distintos
    // para la dificultad adaptativa — solo intentos genuinamente separados.
    recordAttemptOutcome(levelId, false);
  }, [locale, levelId, recordAttemptOutcome]);

  return {
    acknowledgeTap,
    celebrate,
    encourage,
    celebrateSignal,
    confettiField,
    roundComplete,
    continueRound,
    /**
     * Dificultad adaptativa (ver progressStore.recordAttemptOutcome): 1-3,
     * empieza en 1. Un nivel que tenga su propia noción de "más reto" (más
     * piezas, más opciones, más velocidad) puede leerlo para adelantar o
     * atrasar su progresión; la mayoría de los niveles no lo necesitan y
     * simplemente lo ignoran, igual que el valor de retorno de celebrate().
     */
    difficultyLevel,
  };
}
