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
    { id: "kite", nameKey: "explore.object.kite", x: 42, y: 9, size: 6.5, reaction: "soar" },
    { id: "bird", nameKey: "explore.object.bird", x: 60, y: 26, size: 4.5, reaction: "fly" },
    { id: "tree", nameKey: "explore.object.tree", x: 15, y: 58, size: 9, reaction: "shed-leaves" },
    { id: "fountain", nameKey: "explore.object.fountain", x: 42, y: 62, size: 7.5, reaction: "spray" },
    { id: "butterfly", nameKey: "explore.object.butterfly", x: 68, y: 46, size: 4, reaction: "flutter" },
    // Tocar la pelota hace que el compañero elegido la note y festeje
    // (Product Vision §35: "Ball + dog → dog chases ball").
    { id: "ball", nameKey: "explore.object.ball", x: 46, y: 82, size: 5, reaction: "bounce", notifiesBuddy: true },
    { id: "puddle", nameKey: "explore.object.puddle", x: 68, y: 90, size: 7, reaction: "splash" },
    { id: "flower", nameKey: "explore.object.flower", x: 88, y: 78, size: 4.5, reaction: "sway" },
  ],
};
