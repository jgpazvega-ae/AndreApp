import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "AndreApp",
        short_name: "AndreApp",
        description: "Juegos educativos para niños de 0 a 5 años",
        start_url: "/",
        scope: "/",
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
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
});
