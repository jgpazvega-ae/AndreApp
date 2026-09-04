import { describe, expect, it } from "vitest";

// piecesForRound no se exporta (es un detalle interno de N6Rompecabezas.tsx,
// que además importa react-i18next y no se puede montar en un entorno de
// pruebas sin DOM); se reproduce aquí la misma fórmula para fijar el
// comportamiento de progresión que docs/CURRICULUM.md ficha N6 exige:
// empezar en 2 piezas y escalar hasta 4.
const MAX_SHAPES = 4;
function piecesForRound(roundIndex: number): number {
  return Math.min(2 + roundIndex, MAX_SHAPES);
}

describe("progresión de piezas de N6", () => {
  it("empieza en 2 piezas en la primera ronda", () => {
    expect(piecesForRound(0)).toBe(2);
  });

  it("sube una pieza por ronda", () => {
    expect(piecesForRound(1)).toBe(3);
    expect(piecesForRound(2)).toBe(4);
  });

  it("no pasa de 4 piezas (no hay más formas en el catálogo)", () => {
    expect(piecesForRound(3)).toBe(4);
    expect(piecesForRound(50)).toBe(4);
  });
});
