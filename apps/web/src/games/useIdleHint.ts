import { useCallback, useEffect, useRef, useState } from "react";

/** Tiempo sin tocar tras el cual se ofrece una pista visual. */
const DEFAULT_IDLE_DELAY_MS = 5000;

/**
 * Andamiaje por inactividad (docs/CURRICULUM.md §2): si el niño no toca en
 * unos segundos, el nivel se vuelve más evidente en lugar de castigarlo o
 * apurarlo. Devuelve `idle` para mostrar la pista y `resetIdle()` para
 * llamar en cada interacción.
 */
export function useIdleHint(delayMs: number = DEFAULT_IDLE_DELAY_MS) {
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdle = useCallback(() => {
    setIdle(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIdle(true), delayMs);
  }, [delayMs]);

  useEffect(() => {
    resetIdle();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [resetIdle]);

  return { idle, resetIdle };
}
