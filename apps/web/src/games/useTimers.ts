import { useCallback, useEffect, useRef } from "react";

/**
 * Un `setTimeout` que un nivel arma para "después" (una voz que confirma un
 * acierto, un avance de ronda) y nunca cancela sigue vivo cuando el niño ya
 * salió del nivel: la voz suena encima del mapa de mundos, o un `setState`
 * dispara sobre un componente desmontado. Varios niveles reinventaban el
 * mismo array-de-timers-más-limpieza-al-desmontar (ver ContarPista, N5, N9);
 * este hook lo centraliza para que sea automático, no una convención que
 * cada nivel nuevo tiene que recordar.
 */
export function useTimers() {
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const inFlight = timers.current;
    return () => inFlight.forEach(clearTimeout);
  }, []);

  /** Programa `fn` en `ms`, registrada para limpiarse sola al desmontar. */
  const after = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  /** Cancela un timer concreto antes de que dispare (p. ej. "otra vez" adelanta lo que ya estaba programado). */
  const cancel = useCallback((id: ReturnType<typeof setTimeout>) => {
    clearTimeout(id);
    timers.current.delete(id);
  }, []);

  /** Cancela TODOS los timers en vuelo (p. ej. al reiniciar una vuelta con "otra vez"). */
  const cancelAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  return { after, cancel, cancelAll };
}
