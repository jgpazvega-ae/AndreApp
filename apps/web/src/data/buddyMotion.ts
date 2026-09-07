import type { TargetAndTransition, Transition } from "framer-motion";
import type { BuddyId } from "./buddies";

/**
 * El movimiento ES la personalidad.
 *
 * Odie, Dante y Kira no son tres imágenes intercambiables con el mismo
 * saltito: cada uno se mueve como es (ver la ficha de carácter en
 * `buddies.ts`). Esto vive en un módulo propio porque el perrito aparece en
 * CUATRO lugares —el selector de la pantalla de inicio, el anfitrión del
 * mundo, el compañero de la esquina en el juego y su festejo al acertar— y
 * antes solo la esquina del juego tenía acento propio: en los otros tres el
 * mismo perro se movía igual que los otros dos, que es exactamente lo que
 * convierte a un personaje en decoración.
 *
 * Los festejos aplican tres principios de animación clásicos:
 *  - **Anticipación:** nadie salta sin agacharse antes (el primer fotograma
 *    de cada festejo va HACIA ABAJO, aplastado).
 *  - **Squash & stretch:** scaleX/scaleY se compensan (ancho al aplastar,
 *    alto al estirar) para que el cuerpo se sienta con peso, no una calca
 *    que cambia de tamaño.
 *  - **Timing como carácter:** Odie remata rápido y seco, Kira se toma casi
 *    un segundo entero rebotando, Dante nunca despega del suelo.
 */

/** Cuánto dura el festejo de cada uno (ms): quien lo dispara necesita saber cuándo termina. */
export const BUDDY_CHEER_MS: Record<BuddyId, number> = {
  odie: 620,
  dante: 1050,
  kira: 950,
};

/** Reposo: el perrito "respira" en pantalla aunque nadie lo toque. */
export function buddyIdle(id: BuddyId): TargetAndTransition {
  switch (id) {
    // Kira brinca de verdad, todo el tiempo, para que la miren.
    case "kira":
      return { y: [0, -14, 0], scaleY: [1, 1.05, 1], scaleX: [1, 0.97, 1] };
    // Odie no se está quieto: rebote corto y meneo de cola constante.
    case "odie":
      return { y: [0, -8, 0], rotate: [0, -4, 4, 0] };
    // Dante es el mayor: apenas respira. Su calma es lo que lo distingue.
    case "dante":
      return { y: [0, -3, 0] };
  }
}

export function buddyIdleTransition(id: BuddyId): Transition {
  switch (id) {
    case "kira":
      return { duration: 1.1, repeat: Infinity, ease: "easeInOut" };
    case "odie":
      return { duration: 1.7, repeat: Infinity, ease: "easeInOut" };
    case "dante":
      return { duration: 3.4, repeat: Infinity, ease: "easeInOut" };
  }
}

/** Festejo de un acierto del niño, con el carácter de cada perro. */
export function buddyCheer(id: BuddyId): TargetAndTransition {
  switch (id) {
    // Kira: la más exagerada. Se agacha, sale disparada al doble de alto que
    // nadie y rebota tres veces girando — "¡mírame, mírame!".
    case "kira":
      return {
        y: [0, 6, -40, -8, -26, -4, 0],
        rotate: [0, 0, -14, 12, -8, 5, 0],
        scaleY: [1, 0.82, 1.16, 0.94, 1.1, 0.96, 1],
        scaleX: [1, 1.18, 0.9, 1.06, 0.94, 1.03, 1],
      };
    // Odie: dos saltos cortos y secos con sacudida de cabeza. Festeja y
    // además parece estar dando una orden — juguetón, pero mandón.
    case "odie":
      return {
        y: [0, 5, -26, -4, -14, 0],
        rotate: [0, 3, -12, 8, -6, 0],
        scaleY: [1, 0.88, 1.08, 1, 1.04, 1],
        scaleX: [1, 1.12, 0.94, 1, 0.98, 1],
      };
    // Dante: NO salta. Se infla de orgullo y asiente despacio, como el mayor
    // que ya vio esto mil veces y aun así se alegra por el niño.
    case "dante":
      return {
        y: [0, 2, -8, -2, 0],
        rotate: [0, -3, 2, -1, 0],
        scaleY: [1, 0.96, 1.1, 1.02, 1],
        scaleX: [1, 1.05, 1.06, 1, 1],
      };
  }
}

export function buddyCheerTransition(id: BuddyId): Transition {
  switch (id) {
    case "kira":
      return { duration: BUDDY_CHEER_MS.kira / 1000, times: [0, 0.1, 0.34, 0.5, 0.68, 0.85, 1], ease: "easeOut" };
    case "odie":
      return { duration: BUDDY_CHEER_MS.odie / 1000, times: [0, 0.12, 0.4, 0.6, 0.8, 1], ease: "easeOut" };
    case "dante":
      return { duration: BUDDY_CHEER_MS.dante / 1000, times: [0, 0.18, 0.5, 0.78, 1], ease: "easeInOut" };
  }
}
