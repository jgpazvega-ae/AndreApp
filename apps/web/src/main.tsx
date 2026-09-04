import "@fontsource/baloo-2/500.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "./styles/global.css";
import "./i18n/i18n";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// El service worker (registerType: "autoUpdate") se actualiza solo en segundo
// plano, pero eso NO hace que una pestaña ya abierta recargue el JS que ya
// tiene cargado en memoria — seguiría viendo la versión vieja hasta cerrar y
// reabrir la app. Recargar una sola vez cuando el control pasa al SW nuevo
// asegura que quien vuelve a abrir Anico siempre vea los cambios más recientes.
if ("serviceWorker" in navigator) {
  let reloadedForNewVersion = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadedForNewVersion) return;
    reloadedForNewVersion = true;
    window.location.reload();
  });
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("No se encontró el elemento #root");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
