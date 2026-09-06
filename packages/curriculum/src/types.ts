/** Etapa del currículo (ver docs/CURRICULUM.md §4). */
export type Stage = "A" | "B" | "C" | "D";

/** Dominio de contenido principal del nivel. */
export type Domain =
  | "attention"
  | "perception"
  | "categorization"
  | "language"
  | "spatial"
  | "number"
  | "shapes"
  | "memory"
  | "motor"
  | "reading";

/** Eje transversal (ver docs/CURRICULUM.md §3). */
export type TransversalAxis = "executive-function" | "social-emotional";

/**
 * Área de habilidad orientada al padre (Blueprint v1 §"Mapa pedagógico").
 * Reetiqueta de `Domain` para presentación — no reemplaza `domain`, que
 * sigue siendo la clasificación pedagógica fina.
 */
export type SkillArea = "descubro" | "pienso" | "construyo" | "comunico" | "creo" | "resuelvo" | "comprendo";

/** Mundo narrativo (Blueprint v1 §"Arquitectura de mundos"). `null` = aún sin asignar. */
export type WorldId = "estacion" | "bosque" | "oceano";

/** Si un nivel está implementado como juego jugable en esta build. */
export type LevelStatus = "playable" | "coming-soon";

export interface CurriculumLevel {
  /** Identificador estable, p. ej. "n1". Coincide con docs/CURRICULUM.md. */
  id: string;
  /** Número de nivel 1-22, para ordenar y mostrar progreso. */
  order: number;
  stage: Stage;
  domain: Domain;
  axis?: TransversalAxis;
  /** Ver SkillArea. Opcional mientras se completan los 22 niveles. */
  area?: SkillArea;
  /** Ver WorldId. Opcional mientras se completan los 22 niveles. */
  world?: WorldId;
  /** Clave de i18n para el título del nivel (zona de padres; el niño no lee). */
  titleKey: string;
  /** Ícono/emoji representativo (redundancia visual, no depende de texto). */
  icon: string;
  /** true si el nivel es de acceso gratuito (Etapa A completa + muestra de B). */
  free: boolean;
  status: LevelStatus;
}
