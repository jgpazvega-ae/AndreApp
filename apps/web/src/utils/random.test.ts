import { describe, expect, it } from "vitest";
import { pickRandom, pickRandomExcept, shuffle } from "./random";

describe("shuffle", () => {
  it("no muta el arreglo original", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it("conserva exactamente los mismos elementos", () => {
    const items = ["a", "b", "c", "d"];
    expect(shuffle(items).sort()).toEqual([...items].sort());
  });

  it("conserva duplicados", () => {
    expect(shuffle(["a", "a", "b"]).sort()).toEqual(["a", "a", "b"]);
  });

  it("soporta arreglos vacíos y de un elemento", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["solo"])).toEqual(["solo"]);
  });

  it("alcanza más de un orden posible (no es la identidad)", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const orders = new Set(Array.from({ length: 50 }, () => shuffle(items).join(",")));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("pickRandom", () => {
  it("siempre devuelve un elemento del arreglo", () => {
    const items: [string, ...string[]] = ["a", "b", "c"];
    for (let i = 0; i < 30; i++) {
      expect(items).toContain(pickRandom(items));
    }
  });

  it("con un solo elemento devuelve ese elemento", () => {
    expect(pickRandom(["único"])).toBe("único");
  });
});

describe("pickRandomExcept", () => {
  it("nunca repite el elemento excluido", () => {
    const items: [string, ...string[]] = ["dog", "cat", "duck"];
    for (let i = 0; i < 50; i++) {
      expect(pickRandomExcept(items, "cat")).not.toBe("cat");
    }
  });

  it("con exclude null puede devolver cualquiera", () => {
    const items: [string, ...string[]] = ["dog", "cat"];
    expect(items).toContain(pickRandomExcept(items, null));
  });

  it("si excluir dejaría el arreglo vacío, devuelve el único elemento", () => {
    // Sin este caso la consigna se quedaría sin respuesta posible.
    expect(pickRandomExcept(["solo"], "solo")).toBe("solo");
  });
});
