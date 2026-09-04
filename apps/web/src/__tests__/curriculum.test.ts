import { describe, expect, it } from "vitest";
import { CURRICULUM_LEVELS, getLevel, getLevelsByStage } from "@andreapp/curriculum";
import { GAME_REGISTRY } from "../games/registry";

describe("catálogo del currículo", () => {
  it("tiene los 22 niveles del mapa curricular", () => {
    expect(CURRICULUM_LEVELS).toHaveLength(22);
  });

  it("no repite ids", () => {
    const ids = CURRICULUM_LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("numera el orden de 1 a 22 sin huecos", () => {
    const orders = CURRICULUM_LEVELS.map((level) => level.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it("avanza en dificultad: las etapas no se intercalan", () => {
    // El orden de la pantalla de inicio asume A → B → C → D; si un nivel de
    // etapa A quedara con orden mayor que uno de C, el niño vería el salto.
    const stageRank = { A: 0, B: 1, C: 2, D: 3 } as const;
    const ranks = [...CURRICULUM_LEVELS].sort((a, b) => a.order - b.order).map((level) => stageRank[level.stage]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("getLevel encuentra por id y devuelve undefined si no existe", () => {
    expect(getLevel("n1")?.titleKey).toBe("level.n1.title");
    expect(getLevel("n999")).toBeUndefined();
  });

  it("getLevelsByStage devuelve solo esa etapa, ordenada", () => {
    const stageB = getLevelsByStage("B");
    expect(stageB.every((level) => level.stage === "B")).toBe(true);
    expect(stageB.map((l) => l.order)).toEqual([...stageB.map((l) => l.order)].sort((a, b) => a - b));
  });
});

describe("registro de juegos", () => {
  it("todo nivel marcado como jugable tiene su juego implementado", () => {
    const playable = CURRICULUM_LEVELS.filter((level) => level.status === "playable").map((level) => level.id);
    const missing = playable.filter((id) => !GAME_REGISTRY[id]);
    expect(missing).toEqual([]);
  });

  it("todo juego implementado corresponde a un nivel marcado como jugable", () => {
    // Evita el caso contrario: un juego terminado que nadie puede abrir
    // porque el catálogo aún lo marca como "coming-soon".
    const notPlayable = Object.keys(GAME_REGISTRY).filter((id) => getLevel(id)?.status !== "playable");
    expect(notPlayable).toEqual([]);
  });
});
