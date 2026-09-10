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

/**
 * Banda de edad recomendada (Product Vision §12). Es informativa para el
 * padre (Zona de padres, Favoritos) — NUNCA bloquea el juego libre de un
 * nivel ya visible: no existe todavía un dato real de edad del niño en la
 * app, así que usarla como compuerta sería fingir precisión que no hay.
 */
export type AgeRange = "0-2" | "2-3" | "3-4" | "4-5";

/** Habilidad concreta que un nivel practica (Product Vision §13). */
export type SkillTag =
  | "cause-effect"
  | "attention"
  | "fine-motor"
  | "visual-recognition"
  | "color-recognition"
  | "shape-recognition"
  | "categorization"
  | "language"
  | "emotional-recognition"
  | "problem-solving"
  | "counting"
  | "sequencing"
  | "spatial-reasoning"
  | "memory";

/** Cómo interactúa el niño con el nivel — describe el gesto principal. */
export type InteractionType = "tap" | "drag-and-drop" | "match" | "listen-and-select";

/** A cuál de los tres pilares pertenece principalmente (Product Vision §2). */
export type ActivityCategory = "jugar" | "aprender";

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

  /** Metadata pedagógica (Product Vision §13). Opcional mientras se completan los 22 niveles. */
  ageRange?: AgeRange;
  skills?: SkillTag[];
  /** 1 = más sencillo, 3 = más retador. Nunca se usa como examen, solo para ordenar sugerencias. */
  difficulty?: 1 | 2 | 3;
  interactionType?: InteractionType;
  /** Clave i18n de una frase breve para el padre, p. ej. "level.n4.objective". */
  learningObjectiveKey?: string;
  category?: ActivityCategory;
}
