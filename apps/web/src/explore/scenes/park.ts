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
    { id: "cloud", nameKey: "explore.object.cloud", x: 26, y: 16, size: 5.5, reaction: "drift" },
    { id: "bird", nameKey: "explore.object.bird", x: 55, y: 26, size: 4.5, reaction: "fly" },
    { id: "tree", nameKey: "explore.object.tree", x: 17, y: 58, size: 9, reaction: "shed-leaves" },
    { id: "butterfly", nameKey: "explore.object.butterfly", x: 63, y: 50, size: 4, reaction: "flutter" },
    { id: "ball", nameKey: "explore.object.ball", x: 46, y: 80, size: 5, reaction: "bounce" },
    { id: "flower", nameKey: "explore.object.flower", x: 83, y: 78, size: 4.5, reaction: "sway" },
  ],
};
