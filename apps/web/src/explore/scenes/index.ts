import type { ExplorationSceneConfig } from "../types";
import { PARK_SCENE } from "./park";

/**
 * Índice de escenas Explorar construidas. Agregar una escena nueva es
 * escribir su archivo de config (ver park.ts) y sumarla aquí — el motor
 * (ExplorationScene) y la navegación (App.tsx) no cambian.
 */
export const EXPLORE_SCENES: ExplorationSceneConfig[] = [PARK_SCENE];

export function getExploreScene(id: string): ExplorationSceneConfig | undefined {
  return EXPLORE_SCENES.find((scene) => scene.id === id);
}
