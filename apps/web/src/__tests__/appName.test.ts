import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { APP_NAME } from "@andreapp/shared";

const readFromWebRoot = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)), "utf8");

/**
 * APP_NAME vive en packages/shared, pero hay dos lugares que no pueden
 * importarlo: vite.config.ts (lo ejecuta Node sin compilar TypeScript) e
 * index.html (es HTML estático). Ambos repiten el nombre a mano, así que
 * estas pruebas convierten esa duplicación en un error visible si alguien
 * renombra la app y olvida uno de los dos.
 */
describe("nombre de la app", () => {
  it("coincide con el manifest de la PWA en vite.config.ts", () => {
    expect(readFromWebRoot("vite.config.ts")).toContain(`const APP_NAME = "${APP_NAME}"`);
  });

  it("coincide con el <title> de index.html", () => {
    expect(readFromWebRoot("index.html")).toContain(`<title>${APP_NAME}</title>`);
  });
});
