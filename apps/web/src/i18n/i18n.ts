import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { RESOURCES } from "@andreapp/i18n";
import { DEFAULT_LOCALE } from "@andreapp/shared";

/**
 * Zona de padres + etiquetas de accesibilidad únicamente: el niño nunca lee
 * texto en la app (docs/CURRICULUM.md §2). El idioma persistido vive en
 * progressStore (IndexedDB), no en localStorage de i18next.
 */
void i18next.use(initReactI18next).init({
  resources: RESOURCES,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18next;
