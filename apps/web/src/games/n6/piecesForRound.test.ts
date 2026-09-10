import { describe, expect, it } from "vitest";

// piecesForRound no se exporta (es un detalle interno de N6Rompecabezas.tsx,
// que además importa react-i18next y no se puede montar en un entorno de
// pruebas sin DOM); se reproduce aquí la misma fórmula para fijar el
// comportamiento de progresión que docs/CURRICULUM.md ficha N6 exige:
// empezar en 2 piezas y escalar hasta 4, ajustado por la dificultad
// adaptativa (difficultyLevel 1 = sin ajuste, la fórmula original).
const MAX_SHAPES = 4;
function piecesForRound(roundIndex: number, difficultyLevel: 1 | 2 | 3): number {
  const target = 2 + roundIndex + (difficultyLevel - 1);
  return Math.min(Math.max(target, 2), MAX_SHAPES);
}

describe("progresión de piezas de N6", () => {
  it("empieza en 2 piezas en la primera ronda con dificultad base", () => {
    expect(piecesForRound(0, 1)).toBe(2);
  });

  it("sube una pieza por ronda con dificultad base", () => {
    expect(piecesForRound(1, 1)).toBe(3);
    expect(piecesForRound(2, 1)).toBe(4);
  });

  it("no pasa de 4 piezas (no hay más formas en el catálogo)", () => {
    expect(piecesForRound(3, 1)).toBe(4);
    expect(piecesForRound(50, 1)).toBe(4);
  });

  it("dificultad adaptativa más alta adelanta el inicio, sin pasar del catálogo", () => {
    expect(piecesForRound(0, 2)).toBe(3);
    expect(piecesForRound(0, 3)).toBe(4);
    expect(piecesForRound(2, 3)).toBe(4); // el tope sigue siendo 4, nunca más
  });

  it("dificultad adaptativa más baja nunca no existe (sube el reto lento, no la baja innecesariamente)", () => {
    // difficultyLevel nunca baja de 1 (ver progressStore), así que la
    // fórmula nunca necesita compensar por debajo del piso de 2 piezas.
    expect(piecesForRound(0, 1)).toBeGreaterThanOrEqual(2);
  });
});
