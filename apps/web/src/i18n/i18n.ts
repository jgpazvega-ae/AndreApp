import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { RESOURCES } from "@andreapp/i18n";
import { APP_NAME, DEFAULT_LOCALE } from "@andreapp/shared";

/**
 * Zona de padres + etiquetas de accesibilidad únicamente: el niño nunca lee
 * texto en la app (docs/CURRICULUM.md §2). El idioma persistido vive en
 * progressStore (IndexedDB), no en localStorage de i18next.
 *
 * `defaultVariables.appName` resuelve {{appName}} en todos los locales sin
 * pasarlo en cada t(): cambiar el nombre de marca es solo tocar
 * packages/shared (APP_NAME) y apps/web/index.html (HTML estático).
 */
void i18next.use(initReactI18next).init({
  resources: RESOURCES,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false, defaultVariables: { appName: APP_NAME } },
});

export default i18next;
