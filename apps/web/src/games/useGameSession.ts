import { useCallback, useEffect, useState } from "react";
import { playChime, playVoiceClip } from "../audio/audioEngine";
import { useConfetti } from "../effects/useConfetti";
import { useProgressStore } from "../store/progressStore";

/** Espera antes de la voz de bienvenida: da tiempo a que la pantalla entre y el niño la mire. */
const WELCOME_DELAY_MS = 500;

interface GameSessionOptions {
  locale: string;
  /** Clip de voz que da la consigna al entrar, p. ej. "n3-welcome.mp3". */
  welcomeFile: string;
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
export function useGameSession(levelId: string, { locale, welcomeFile }: GameSessionOptions) {
  const [celebrateSignal, setCelebrateSignal] = useState(0);
  const recordPlay = useProgressStore((state) => state.recordPlay);
  const { burst, confettiField } = useConfetti();

  useEffect(() => {
    recordPlay(levelId);
    const timer = setTimeout(() => playVoiceClip(locale, welcomeFile), WELCOME_DELAY_MS);
    return () => clearTimeout(timer);
    // Solo al montar: la consigna de bienvenida no debe repetirse si cambia el idioma a media partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Acusa recibo de un toque que no es un acierto (una selección
   * intermedia, o una respuesta equivocada). Suena igual que siempre: el
   * niño necesita saber que la app lo escuchó, y docs/CURRICULUM.md §2
   * prohíbe el sonido de error — el "no" se comunica visualmente.
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
      playChime();
      if (event) burst(event.clientX, event.clientY);
      setCelebrateSignal((n) => n + 1);
    },
    [burst],
  );

  return { acknowledgeTap, celebrate, celebrateSignal, confettiField };
}
