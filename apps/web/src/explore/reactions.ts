import type { TargetAndTransition, Transition } from "framer-motion";
import type { ExploreReaction } from "./types";

/**
 * Coreografía por tipo de reacción — mismo principio que buddyMotion.ts:
 * el movimiento ES el objeto. `idle` es el ciclo suave que corre siempre
 * (Product Vision §8: "los escenarios deben evolucionar" incluso sin
 * interacción); `tap` es la reacción grande de causa-efecto al tocarlo,
 * con anticipación y squash & stretch como los festejos del compañero.
 */

export const REACTION_TAP_MS: Record<ExploreReaction, number> = {
  shine: 700,
  drift: 500,
  fly: 750,
  "shed-leaves": 900,
  flutter: 800,
  bounce: 800,
  sway: 700,
  soar: 900,
  splash: 600,
  spray: 700,
};

export function objectIdle(reaction: ExploreReaction): TargetAndTransition {
  switch (reaction) {
    case "shine":
      return { scale: [1, 1.05, 1] };
    case "drift":
      return { x: [0, 16, 0] };
    case "fly":
      return { y: [0, -5, 0] };
    case "shed-leaves":
      return { rotate: [0, -1.5, 1.5, 0] };
    case "flutter":
      return { scaleX: [1, 0.78, 1], y: [0, -4, 0] };
    case "bounce":
      return { scale: [1, 1.03, 1] };
    case "sway":
      return { rotate: [0, -4, 4, 0] };
    case "soar":
      return { y: [0, -10, 0], rotate: [0, 3, -3, 0] };
    case "splash":
      return { scale: [1, 1.02, 1] };
    case "spray":
      return { scaleY: [1, 1.04, 1] };
  }
}

export function objectIdleTransition(reaction: ExploreReaction): Transition {
  switch (reaction) {
    case "shine":
      return { duration: 2.6, repeat: Infinity, ease: "easeInOut" };
    case "drift":
      return { duration: 14, repeat: Infinity, ease: "easeInOut" };
    case "fly":
      return { duration: 2.2, repeat: Infinity, ease: "easeInOut" };
    case "shed-leaves":
      return { duration: 3.6, repeat: Infinity, ease: "easeInOut" };
    case "flutter":
      return { duration: 0.7, repeat: Infinity, ease: "easeInOut" };
    case "bounce":
      return { duration: 1.8, repeat: Infinity, ease: "easeInOut" };
    case "sway":
      return { duration: 2.8, repeat: Infinity, ease: "easeInOut" };
    case "soar":
      return { duration: 3.2, repeat: Infinity, ease: "easeInOut" };
    case "splash":
      return { duration: 3, repeat: Infinity, ease: "easeInOut" };
    case "spray":
      return { duration: 1.4, repeat: Infinity, ease: "easeInOut" };
  }
}

/** Reacción grande al toque — nunca se solapa con `idle` (se reemplaza mientras dura). */
export function objectTap(reaction: ExploreReaction): TargetAndTransition {
  switch (reaction) {
    // El sol brilla: crece con un resplandor y vuelve, sin salir de su sitio.
    case "shine":
      return { scale: [1, 1.4, 1.15, 1], rotate: [0, 12, -6, 0] };
    // La nube se esponja un instante, como una ráfaga de viento la empujara.
    case "drift":
      return { scale: [1, 1.18, 1], x: [0, 10, 0], y: [0, -6, 0] };
    // El pájaro alza vuelo y se posa de nuevo (anticipación: se agacha antes de subir).
    case "fly":
      return { y: [0, 8, -34, -14, -26, 0], rotate: [0, 4, -8, 6, -4, 0] };
    // El árbol se sacude y caen hojas (las hojas las dibuja InteractiveObject aparte).
    case "shed-leaves":
      return { rotate: [0, -5, 5, -4, 3, 0] };
    // La mariposa revolotea más rápido y da una vuelta corta, como si siguiera el dedo.
    case "flutter":
      return { scaleX: [1, 0.6, 1, 0.7, 1], x: [0, 14, -10, 6, 0], y: [0, -18, -6, -12, 0] };
    // La pelota rebota con squash & stretch decreciente, como un rebote real que se apaga.
    case "bounce":
      return {
        y: [0, -8, -70, -8, -34, -6, -10, 0],
        scaleY: [1, 0.8, 1.1, 0.85, 1.05, 0.92, 1.02, 1],
        scaleX: [1, 1.15, 0.92, 1.1, 0.95, 1.05, 0.98, 1],
      };
    // La flor se mece más y "florece" un instante (pequeño pulso de tamaño).
    case "sway":
      return { rotate: [0, -10, 9, -6, 0], scale: [1, 1.12, 1.04, 1] };
    // La cometa se agacha (anticipación) y luego sube alto, columpiándose.
    case "soar":
      return { y: [0, 10, -50, -30, -44, -26, -34, 0], rotate: [0, -4, 8, -6, 6, -4, 3, 0] };
    // El charco se ondula hacia afuera (los anillos los dibuja InteractiveObject aparte).
    case "splash":
      return { scaleX: [1, 1.2, 0.95, 1.05, 1], scaleY: [1, 0.85, 1.05, 0.98, 1] };
    // La fuente lanza un chorro más alto un instante y vuelve a su altura de reposo.
    case "spray":
      return { scaleY: [1, 1.35, 1.1, 1], y: [0, -6, -2, 0] };
  }
}

export function objectTapTransition(reaction: ExploreReaction): Transition {
  const duration = REACTION_TAP_MS[reaction] / 1000;
  switch (reaction) {
    case "shine":
      return { duration, times: [0, 0.35, 0.7, 1], ease: "easeOut" };
    case "drift":
      return { duration, ease: "easeOut" };
    case "fly":
      return { duration, times: [0, 0.12, 0.45, 0.65, 0.85, 1], ease: "easeOut" };
    case "shed-leaves":
      return { duration, ease: "easeInOut" };
    case "flutter":
      return { duration, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" };
    case "bounce":
      return { duration, times: [0, 0.1, 0.32, 0.48, 0.66, 0.8, 0.92, 1], ease: "easeOut" };
    case "sway":
      return { duration, times: [0, 0.3, 0.65, 1], ease: "easeOut" };
    case "soar":
      return { duration, times: [0, 0.12, 0.4, 0.55, 0.7, 0.82, 0.92, 1], ease: "easeOut" };
    case "splash":
      return { duration, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeOut" };
    case "spray":
      return { duration, times: [0, 0.3, 0.65, 1], ease: "easeOut" };
  }
}
