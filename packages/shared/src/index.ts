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
}
