/**
 * Catálogo de escenas Explorar para el selector (ExploreHubScreen). Separado
 * de `explore/scenes/park.ts` (la config JUGABLE) porque este catálogo
 * también lista las escenas todavía no construidas, para que el padre vea
 * el mismo tipo de "muy pronto" que ya existe en WorldScreen — no se
 * inventa un segundo lenguaje visual para "esto no existe aún".
 */
export interface ExploreCatalogEntry {
  id: string;
  nameKey: string;
  built: boolean;
}

export const EXPLORE_CATALOG: ExploreCatalogEntry[] = [
  { id: "park", nameKey: "explore.scene.park.name", built: true },
  { id: "estacion", nameKey: "explore.scene.estacion.name", built: false },
  { id: "oceano", nameKey: "explore.scene.oceano.name", built: false },
  { id: "ciudad", nameKey: "explore.scene.ciudad.name", built: false },
  { id: "casa", nameKey: "explore.scene.casa.name", built: false },
  { id: "espacio", nameKey: "explore.scene.espacio.name", built: false },
];
