/**
 * Dificultad adaptativa: la lógica pura de cuándo subir o bajar un nivel de
 * reto, separada de progressStore (que solo la conecta a un `levelId` y la
 * persiste). Vive en su propio módulo para poder probarla sin arrastrar
 * Zustand + el middleware de persistencia (que en pruebas Node falla al no
 * encontrar IndexedDB) — el mismo motivo por el que piecesForRound.test.ts
 * reproduce su fórmula en vez de montar el nivel real.
 */

export interface DifficultyState {
  difficultyLevel: 1 | 2 | 3;
  easyStreak: number;
  struggleStreak: number;
}

export const BASE_DIFFICULTY: DifficultyState = { difficultyLevel: 1, easyStreak: 0, struggleStreak: 0 };

/** Aciertos seguidos sin ayuda antes de subir un nivel de reto. */
export const EASY_STREAK_TO_LEVEL_UP = 6;
/** Intentos seguidos con ayuda antes de bajar un nivel de reto — menos que
 * EASY_STREAK_TO_LEVEL_UP a propósito: se es rápido para simplificar,
 * paciente para retar más (nunca al revés, y nunca solo por completar una
 * pantalla). */
export const STRUGGLE_STREAK_TO_LEVEL_DOWN = 3;

/**
 * Aplica un intento (acierto o intento con ayuda) al estado de dificultad de
 * un nivel. Cruzar el umbral sube o baja UN nivel (nunca salta) y la racha
 * contraria vuelve a cero, para que "casi subir" no quede a medias
 * esperando indefinidamente.
 */
export function nextDifficultyState(current: DifficultyState, correct: boolean): DifficultyState {
  if (correct) {
    const easyStreak = current.easyStreak + 1;
    if (easyStreak >= EASY_STREAK_TO_LEVEL_UP && current.difficultyLevel < 3) {
      return { difficultyLevel: (current.difficultyLevel + 1) as 1 | 2 | 3, easyStreak: 0, struggleStreak: 0 };
    }
    return { ...current, easyStreak, struggleStreak: 0 };
  }

  const struggleStreak = current.struggleStreak + 1;
  if (struggleStreak >= STRUGGLE_STREAK_TO_LEVEL_DOWN && current.difficultyLevel > 1) {
    return { difficultyLevel: (current.difficultyLevel - 1) as 1 | 2 | 3, easyStreak: 0, struggleStreak: 0 };
  }
  return { ...current, easyStreak: 0, struggleStreak };
}
