import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { APP_NAME } from "@andreapp/shared";

/**
 * En producción real (Neubox/Render, PLAN.md §4.3) la app vive en la raíz
 * de su propio subdominio (`app.<dominio>/`). GitHub Pages, en cambio, la
 * sirve bajo `/<repo>/` (proyecto, no dominio propio) — por eso el base
 * path es configurable vía VITE_BASE_PATH (lo fija el workflow de Pages),
 * sin afectar el build normal (dev, Render, Neubox), que sigue siendo "/".
 */
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        // Relativos a la URL del manifest: funcionan igual sirviendo desde
        // "/" o desde "/<repo>/" sin duplicar configuración.
        id: ".",
        name: APP_NAME,
        short_name: APP_NAME,
        description: "Juegos educativos para niños de 0 a 5 años",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FFF7ED",
        theme_color: "#FFB03B",
        lang: "es-MX",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precarga solo el shell de la app; los assets de audio/idioma se
        // cachean bajo demanda (PLAN.md §2: cuota de almacenamiento ajustada en iOS).
        globPatterns: ["**/*.{js,css,html,svg}"],
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.*\.(mp3|m4a)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "andreapp-audio",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            urlPattern: /\/icons\/.*\.png$/,
            handler: "CacheFirst",
            options: { cacheName: "andreapp-icons" },
          },
          {
            urlPattern: /\/illustrations\/.*\.(png|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "andreapp-illustrations",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
});
