import { describe, expect, it } from "vitest";
import { CURRICULUM_LEVELS } from "@andreapp/curriculum";
import { RESOURCES } from "@andreapp/i18n";
import { SUPPORTED_LOCALES } from "@andreapp/shared";

const BASE_LOCALE = "es-MX";
const baseKeys = Object.keys(RESOURCES[BASE_LOCALE].translation);

/**
 * La app se publica en 3 idiomas y el niño no lee: una clave faltante se
 * ve como texto crudo ("a11y.animal") en la etiqueta de accesibilidad, o
 * como un botón sin nombre. Es el tipo de error que no aparece probando
 * en español.
 */
describe("catálogos de traducción", () => {
  it("cubre los 3 idiomas soportados", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(RESOURCES[locale]).toBeDefined();
    }
  });

  it.each(SUPPORTED_LOCALES)("%s tiene exactamente las mismas claves que es-MX", (locale) => {
    const keys = Object.keys(RESOURCES[locale].translation);
    expect(keys.filter((k) => !baseKeys.includes(k))).toEqual([]); // sobrantes
    expect(baseKeys.filter((k) => !keys.includes(k))).toEqual([]); // faltantes
  });

  it.each(SUPPORTED_LOCALES)("%s no deja ningún valor vacío", (locale) => {
    const empty = Object.entries(RESOURCES[locale].translation)
      .filter(([, value]) => typeof value !== "string" || value.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it.each(SUPPORTED_LOCALES)("%s traduce el título de los 22 niveles del currículo", (locale) => {
    const translation = RESOURCES[locale].translation as Record<string, string>;
    const missing = CURRICULUM_LEVELS.filter((level) => !translation[level.titleKey]).map((level) => level.titleKey);
    expect(missing).toEqual([]);
  });
});
