import { defineConfig } from "vitest/config";

/**
 * Config propia de pruebas (no reusa vite.config.ts) para no arrastrar el
 * plugin de PWA: generar el Service Worker en cada corrida es lento y no
 * aporta nada a las pruebas.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
