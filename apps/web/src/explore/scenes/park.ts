import type { ExplorationSceneConfig } from "../types";

/**
 * Escena piloto de Explorar (Product Vision §7, §9): "Un día en el parque".
 * Config pura — el motor (ExplorationScene/InteractiveObject) no sabe nada
 * de parques; una escena nueva (Estación, Océano…) es solo un archivo como
 * este.
 */
export const PARK_SCENE: ExplorationSceneConfig = {
  id: "park",
  nameKey: "explore.scene.park.name",
  background: "linear-gradient(180deg, #BEE9FF 0%, #EAF8FF 52%, #BCEBDA 100%)",
  objects: [
    { id: "sun", nameKey: "explore.object.sun", x: 78, y: 14, size: 6.5, reaction: "shine" },
    // Tocar la nube agita el charco (Product Vision §35: "Rain + puddle → puddle grows"):
    // el niño descubre la conexión aunque nunca haya tocado el charco directamente.
    {
      id: "cloud",
      nameKey: "explore.object.cloud",
      x: 26,
      y: 16,
      size: 5.5,
      reaction: "drift",
      chainTargetId: "puddle",
    },
    // Cometa y columpio se arrastran (no se tocan): el hilo/la cuerda
    // siguen el dedo y regresan solos, como un juguete de verdad.
    { id: "kite", nameKey: "explore.object.kite", x: 42, y: 9, size: 6.5, reaction: "soar", drag: "kite" },
    { id: "bird", nameKey: "explore.object.bird", x: 60, y: 26, size: 4.5, reaction: "fly" },
    { id: "tree", nameKey: "explore.object.tree", x: 15, y: 58, size: 9, reaction: "shed-leaves" },
    {
      id: "swing",
      nameKey: "explore.object.swing",
      x: 30,
      y: 38,
      size: 8,
      reaction: "sway",
      drag: "swing",
      notifiesBuddy: true,
    },
    { id: "fountain", nameKey: "explore.object.fountain", x: 42, y: 60, size: 7.5, reaction: "spray" },
    { id: "butterfly", nameKey: "explore.object.butterfly", x: 68, y: 46, size: 4, reaction: "flutter" },
    { id: "bench", nameKey: "explore.object.bench", x: 68, y: 58, size: 7, reaction: "creak", notifiesBuddy: true },
    // Descubrimientos camuflados (Product Vision — curiosity design): no
    // llaman la atención, se confunden con la decoración del suelo. 4rem
    // (--touch-target-min) para que "pequeño" no signifique "difícil de tocar".
    // Lejos de la esquina donde vive el compañero (left:8%/bottom:6% en
    // ExplorationScene): ahí encima quedaba tapado por el perrito.
    { id: "stone", nameKey: "explore.object.stone", x: 84, y: 63, size: 4, reaction: "wobble" },
    { id: "grass", nameKey: "explore.object.grass", x: 47, y: 72, size: 4, reaction: "sparkle" },
    // Tocar la pelota hace que el compañero elegido la note y festeje
    // (Product Vision §35: "Ball + dog → dog chases ball").
    { id: "ball", nameKey: "explore.object.ball", x: 55, y: 80, size: 5, reaction: "bounce", notifiesBuddy: true },
    { id: "flower", nameKey: "explore.object.flower", x: 80, y: 80, size: 4.5, reaction: "sway" },
    // Tocar el charco revela a la rana (Product Vision: "tap charco → aparece
    // rana") — descubrimiento sin explicar, la rana no existe hasta entonces.
    // Entre la pelota y la flor, sin pisar el área tocable de ninguna de las
    // dos (y sin bajar tanto que se recorte contra el borde inferior, como
    // pasaba en y:90-92 en pantallas más bajas, iPhone 13 incluido).
    {
      id: "puddle",
      nameKey: "explore.object.puddle",
      x: 68,
      y: 84,
      size: 5,
      reaction: "splash",
      chainTargetId: "frog",
    },
    { id: "frog", nameKey: "explore.object.frog", x: 78, y: 89, size: 4, reaction: "hop", startsHidden: true },
  ],
};
