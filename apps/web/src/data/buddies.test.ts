import { describe, expect, it } from "vitest";
import { BUDDIES, getBuddy } from "./buddies";

describe("BUDDIES", () => {
  it("tiene exactamente 3 compañeros con ids únicos", () => {
    const ids = new Set(BUDDIES.map((b) => b.id));
    expect(ids.size).toBe(3);
  });

  it("cada uno tiene su propio ladrido (sin reutilizar el de otro)", () => {
    expect(new Set(BUDDIES.map((b) => b.barkSound)).size).toBe(3);
  });
});

describe("getBuddy", () => {
  it("devuelve el compañero que corresponde a un id válido", () => {
    expect(getBuddy("dante").id).toBe("dante");
  });

  it("cae de vuelta al primer compañero si aún no se ha elegido ninguno", () => {
    expect(getBuddy(null).id).toBe(BUDDIES[0].id);
  });
});
