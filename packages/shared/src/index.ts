/**
 * Nombre de marca de la app — fuente única de verdad. Cambiarlo aquí (y
 * en apps/web/index.html, que es HTML estático sin acceso a este módulo)
 * actualiza el nombre en toda la UI, el manifest de la PWA y los locales.
 */
export const APP_NAME = "Anico";

/** Idiomas soportados por la app (ver PLAN.md §7). */
export type AppLocale = "es-MX" | "en" | "pt-BR";

export const SUPPORTED_LOCALES: AppLocale[] = ["es-MX", "en", "pt-BR"];

export const DEFAULT_LOCALE: AppLocale = "es-MX";

/**
 * Progreso de dominio por nivel, persistido localmente (IndexedDB).
 * "mastered" habilita el desbloqueo del siguiente nivel del dominio,
 * pero el juego libre de niveles ya vistos siempre queda disponible
 * (docs/CURRICULUM.md §6: la maestría no es un examen).
 */
export interface LevelProgress {
  levelId: string;
  timesPlayed: number;
  mastered: boolean;
  lastPlayedAt: string | null;
  /**
   * Rondas completadas (ver useGameSession.roundSize): a diferencia de
   * "mastered", esto nunca evalúa desempeño, solo cuenta cierres de sesión
   * — el niño necesita un final visible en vez de un ejercicio infinito.
   */
  roundsCompleted: number;
  /**
   * Dificultad adaptativa (ver useGameSession.recordAttemptOutcome): 1 = el
   * punto de partida del nivel, 2-3 = un paso o dos más de reto. Nunca se
   * muestra al niño ni al padre — es una señal interna que un nivel puede
   * leer para adelantar o atrasar SU propia progresión (p. ej. N6 empieza
   * el siguiente rompecabezas con una pieza de más o de menos). Sube
   * despacio (aciertos sostenidos) y baja rápido (varios intentos
   * seguidos con ayuda) a propósito: nunca se sube el reto solo porque se
   * completó una pantalla.
   */
  difficultyLevel: 1 | 2 | 3;
  /** Aciertos seguidos sin ayuda desde el último cambio de difficultyLevel. */
  easyStreak: number;
  /** Intentos seguidos que necesitaron ayuda desde el último cambio de difficultyLevel. */
  struggleStreak: number;
}
