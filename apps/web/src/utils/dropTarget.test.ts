import { describe, expect, it } from "vitest";
import { findDropTarget } from "./dropTarget";

function fakeRect(overrides: Partial<DOMRect>): HTMLElement {
  const rect: DOMRect = {
    left: 0,
    right: 100,
    top: 0,
    bottom: 100,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    toJSON: () => ({}),
    ...overrides,
  };
  return { getBoundingClientRect: () => rect } as unknown as HTMLElement;
}

describe("findDropTarget", () => {
  it("devuelve la clave cuyo elemento contiene el punto", () => {
    const refs = new Map<string, HTMLElement | null>([
      ["a", fakeRect({ left: 0, right: 100, top: 0, bottom: 100 })],
      ["b", fakeRect({ left: 200, right: 300, top: 0, bottom: 100 })],
    ]);
    expect(findDropTarget({ x: 50, y: 50 }, refs)).toBe("a");
    expect(findDropTarget({ x: 250, y: 50 }, refs)).toBe("b");
  });

  it("devuelve null si el punto no cae en ningún elemento", () => {
    const refs = new Map<string, HTMLElement | null>([["a", fakeRect({ left: 0, right: 100, top: 0, bottom: 100 })]]);
    expect(findDropTarget({ x: 500, y: 500 }, refs)).toBeNull();
  });

  it("aplica el margen de captura generoso (imán)", () => {
    const refs = new Map<string, HTMLElement | null>([
      ["a", fakeRect({ left: 100, right: 200, top: 100, bottom: 200 })],
    ]);
    expect(findDropTarget({ x: 90, y: 150 }, refs)).toBeNull();
    expect(findDropTarget({ x: 90, y: 150 }, refs, 20)).toBe("a");
  });

  it("ignora refs nulas (elementos aún no montados o desmontados)", () => {
    const refs = new Map<string, HTMLElement | null>([["a", null]]);
    expect(findDropTarget({ x: 50, y: 50 }, refs)).toBeNull();
  });
});
