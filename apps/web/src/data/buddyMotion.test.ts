import { describe, expect, it } from "vitest";
import { BUDDIES } from "./buddies";
import { BUDDY_CHEER_MS, buddyCheer, buddyCheerTransition, buddyIdle } from "./buddyMotion";

const IDS = BUDDIES.map((b) => b.id);

/**
 * La personalidad de Odie, Dante y Kira es un requisito de producto, no un
 * adorno: si alguien "simplifica" estas animaciones a una sola compartida,
 * los tres perritos vuelven a ser la misma imagen con distinto pelaje. Estas
 * pruebas fijan lo que los distingue como comportamiento observable.
 */
describe("movimiento de cada perrito", () => {
  it("ninguno se mueve igual que otro, ni en reposo ni al festejar", () => {
    const idles = IDS.map((id) => JSON.stringify(buddyIdle(id)));
    const cheers = IDS.map((id) => JSON.stringify(buddyCheer(id)));
    expect(new Set(idles).size).toBe(IDS.length);
    expect(new Set(cheers).size).toBe(IDS.length);
  });

  it("todo festejo empieza con anticipación: el primer movimiento va hacia abajo", () => {
    // Principio de animación: nadie salta sin agacharse antes. `y` positivo
    // es hacia abajo en pantalla.
    for (const id of IDS) {
      const y = buddyCheer(id).y as number[];
      expect(y[0]).toBe(0);
      expect(y[1]!).toBeGreaterThan(0);
      expect(Math.min(...y)).toBeLessThan(0); // y después sí despega
      expect(y.at(-1)).toBe(0); // y siempre vuelve a su sitio
    }
  });

  it("Kira brinca más alto que Odie, y Dante casi no despega", () => {
    const peak = (id: (typeof IDS)[number]) => Math.min(...(buddyCheer(id).y as number[]));
    expect(peak("kira")).toBeLessThan(peak("odie")); // más negativo = más alto
    expect(peak("odie")).toBeLessThan(peak("dante"));
  });

  it("el timing acompaña al carácter: Odie remata rápido, Dante se toma su tiempo", () => {
    expect(BUDDY_CHEER_MS.odie).toBeLessThan(BUDDY_CHEER_MS.kira);
    expect(BUDDY_CHEER_MS.kira).toBeLessThan(BUDDY_CHEER_MS.dante);
  });

  it("los keyframes y sus tiempos coinciden (si no, framer-motion los ignora en silencio)", () => {
    for (const id of IDS) {
      const times = buddyCheerTransition(id).times as number[];
      const cheer = buddyCheer(id) as Record<string, number[]>;
      for (const [prop, frames] of Object.entries(cheer)) {
        expect(frames.length, `${id}.${prop}`).toBe(times.length);
      }
      expect(times[0]).toBe(0);
      expect(times.at(-1)).toBe(1);
    }
  });
});
