/**
 * Catálogo de la biblioteca de Jugar (Product Vision — "Game Expansion"):
 * juegos autoexplicativos y rejugables, DISTINTOS de los 22 niveles del
 * currículo (packages/curriculum) — esos son la secuencia pedagógica de
 * Aprender, con orden y objetivo de aprendizaje formal. Un juego de Jugar
 * no tiene "siguiente nivel": se abre, se juega, se repite.
 *
 * Deliberadamente más liviano que CurriculumLevel (sin stage/domain/area):
 * reutiliza GameShell + useGameSession igual que los niveles, así que no
 * hace falta duplicar esa maquinaria — solo el catálogo para mostrarlos.
 */

/** El gesto principal del juego — para que la biblioteca muestre variedad real, no la misma mecánica repetida. */
export type JugarMechanic = "tap" | "drag" | "match";

export interface JugarGame {
  id: string;
  titleKey: string;
  icon: string;
  gradient: [string, string];
  mechanic: JugarMechanic;
}

export const JUGAR_GAMES: JugarGame[] = [
  { id: "burbujas", titleKey: "jugar.burbujas.title", icon: "🫧", gradient: ["#8ED8FF", "#4FA8E8"], mechanic: "tap" },
  { id: "estrellas", titleKey: "jugar.estrellas.title", icon: "⭐", gradient: ["#2A2A5C", "#14142E"], mechanic: "tap" },
  { id: "colores", titleKey: "jugar.colores.title", icon: "🎨", gradient: ["#F58BC0", "#9B7FEE"], mechanic: "match" },
  { id: "animales", titleKey: "jugar.animales.title", icon: "🐾", gradient: ["#8CE6C6", "#3FBE8E"], mechanic: "match" },
  { id: "alimenta", titleKey: "jugar.alimenta.title", icon: "🥕", gradient: ["#FFC98A", "#F0761E"], mechanic: "drag" },
];
