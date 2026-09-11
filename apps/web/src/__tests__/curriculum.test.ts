import { describe, expect, it } from "vitest";
import { CURRICULUM_LEVELS, getLevel, getLevelsByStage, getLevelsByWorld } from "@andreapp/curriculum";
import { JUGAR_GAMES } from "../data/jugarGames";
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

  it("no repite el ícono dentro de un mismo mundo", () => {
    // El niño no lee: el ícono ES el nombre del juego para él. Dos mosaicos
    // con el mismo emoji en la misma pantalla de mundo son indistinguibles
    // (fue el caso real de N3 y N6, ambos 🧩 en El Bosque).
    for (const world of ["estacion", "bosque", "oceano"] as const) {
      const icons = getLevelsByWorld(world).map((level) => level.icon);
      expect(new Set(icons).size).toBe(icons.length);
    }
  });

  it("todo nivel tiene un mundo asignado y getLevelsByWorld los reparte sin perder ninguno", () => {
    expect(CURRICULUM_LEVELS.every((level) => level.world !== undefined)).toBe(true);
    const byWorld = [...getLevelsByWorld("estacion"), ...getLevelsByWorld("bosque"), ...getLevelsByWorld("oceano")];
    expect(byWorld).toHaveLength(CURRICULUM_LEVELS.length);
  });

  it("todo nivel jugable trae su metadata pedagógica completa (Product Vision §13)", () => {
    // Sin esto, "habilidades practicadas hoy" (ParentZoneScreen) y Jugar/
    // Favoritos se quedan callados para cualquier nivel nuevo que se le
    // olvide poblarla — un olvido silencioso, no un error visible.
    const playable = CURRICULUM_LEVELS.filter((level) => level.status === "playable");
    const incomplete = playable
      .filter(
        (level) =>
          !level.ageRange ||
          !level.skills ||
          level.skills.length === 0 ||
          !level.difficulty ||
          !level.interactionType ||
          !level.learningObjectiveKey ||
          !level.category,
      )
      .map((level) => level.id);
    expect(incomplete).toEqual([]);
  });
});

describe("registro de juegos", () => {
  it("todo nivel marcado como jugable tiene su juego implementado", () => {
    const playable = CURRICULUM_LEVELS.filter((level) => level.status === "playable").map((level) => level.id);
    const missing = playable.filter((id) => !GAME_REGISTRY[id]);
    expect(missing).toEqual([]);
  });

  it("todo juego implementado corresponde a un nivel marcado como jugable o a un juego de la biblioteca de Jugar", () => {
    // Evita el caso contrario: un juego terminado que nadie puede abrir —
    // porque el currículo aún lo marca como "coming-soon", o porque no
    // está en el catálogo de Jugar (data/jugarGames.ts, los juegos que NO
    // son parte de la secuencia pedagógica de 22 niveles).
    const jugarIds = new Set(JUGAR_GAMES.map((game) => game.id));
    const orphaned = Object.keys(GAME_REGISTRY).filter(
      (id) => getLevel(id)?.status !== "playable" && !jugarIds.has(id),
    );
    expect(orphaned).toEqual([]);
  });
});

describe("biblioteca de Jugar", () => {
  it("no repite ids", () => {
    const ids = JUGAR_GAMES.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no repite ids con el currículo (misma clave de progreso/favoritos)", () => {
    const curriculumIds = new Set(CURRICULUM_LEVELS.map((level) => level.id));
    const overlap = JUGAR_GAMES.filter((game) => curriculumIds.has(game.id));
    expect(overlap).toEqual([]);
  });

  it("todo juego de la biblioteca tiene su componente implementado", () => {
    const missing = JUGAR_GAMES.filter((game) => !GAME_REGISTRY[game.id]).map((game) => game.id);
    expect(missing).toEqual([]);
  });
});
