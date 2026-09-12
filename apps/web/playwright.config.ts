import { defineConfig, devices } from "@playwright/test";

/**
 * E2E contra el build de producción, no contra el dev server: lo que se
 * quiere verificar es exactamente lo que se publica (base path, assets,
 * Service Worker).
 *
 * Se emula un iPhone 13 porque la app es iOS-first (PLAN.md §2) y varias
 * decisiones — desbloqueo de audio por gesto, safe areas, tamaño de los
 * blancos táctiles — solo se rompen en móvil.
 *
 * El motor es Chromium, no WebKit: es el único navegador disponible en
 * todos los entornos donde corre esta suite. Emular el viewport de iPhone
 * cubre layout y toque, pero NO las peculiaridades del motor de Safari
 * (audio, Service Worker) — esas siguen necesitando prueba en un iPhone
 * real antes de publicar.
 */
/**
 * Ruta a un Chromium ya presente en la máquina. Se usa en entornos que
 * traen el navegador preinstalado (y donde `playwright install` no debe
 * correr); si no está definida, Playwright usa el que él mismo descargó.
 */
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:4173/",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "iphone",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4173 --strictPort",
        url: "http://localhost:4173/",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
