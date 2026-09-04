import { describe, expect, it } from "vitest";
import { CURRICULUM_LEVELS } from "@andreapp/curriculum";
import { buddyForLevel } from "./GameBuddy";

describe("buddyForLevel", () => {
  it("asigna el mismo perrito al mismo nivel siempre", () => {
    expect(buddyForLevel("n3")).toBe(buddyForLevel("n3"));
  });

  it("devuelve un asset de amigo para cada nivel del currículo", () => {
    for (const level of CURRICULUM_LEVELS) {
      expect(buddyForLevel(level.id)).toMatch(/^illustrations\/friend-[123]\.png$/);
    }
  });

  it("distingue niveles de uno y dos dígitos", () => {
    // "n1" y "n11" terminan en el mismo carácter: si la asignación mirara
    // solo el último dígito, colisionarían al azar en vez de repartirse.
    const assignments = new Set([buddyForLevel("n1"), buddyForLevel("n11"), buddyForLevel("n21")]);
    expect(assignments.size).toBe(3);
  });

  it("usa a los tres perritos a lo largo del currículo", () => {
    const used = new Set(CURRICULUM_LEVELS.map((level) => buddyForLevel(level.id)));
    expect(used.size).toBe(3);
  });
});
