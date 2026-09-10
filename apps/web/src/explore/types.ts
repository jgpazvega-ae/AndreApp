/**
 * Motor de escenas "Explorar" (Product Vision §5-8, §20-21): un sistema
 * data-driven — la mecánica de causa-efecto vive UNA vez en
 * InteractiveObject/ExplorationScene; cada escena nueva (Parque, Estación,
 * Océano…) es solo esta config, sin escribir componentes nuevos.
 */

/** Vocabulario cerrado de reacciones: cada una trae su propia animación,
 * sonido sintetizado y ambientación en reactions.ts/sounds. Un objeto nuevo
 * reutiliza una de estas en vez de inventar coreografía propia. */
export type ExploreReaction = "shine" | "drift" | "fly" | "shed-leaves" | "flutter" | "bounce" | "sway";

export interface InteractiveObjectConfig {
  /** Estable dentro de la escena; se usa para registrar descubrimientos. */
  id: string;
  /** Clave i18n del nombre (aria-label — el niño no lee, pero un lector de pantalla sí). */
  nameKey: string;
  /** Posición en % del lienzo de la escena (0-100). */
  x: number;
  y: number;
  /** Tamaño del objeto, en rem. */
  size: number;
  reaction: ExploreReaction;
}

export interface ExplorationSceneConfig {
  id: string;
  nameKey: string;
  /** Fondo CSS (degradado), mismo lenguaje visual que GameShell. */
  background: string;
  objects: InteractiveObjectConfig[];
}
