import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { WorldId } from "@andreapp/curriculum";
import { AudioUnlockGate } from "./components/AudioUnlockGate";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ExplorationScene } from "./explore/ExplorationScene";
import { getExploreScene } from "./explore/scenes";
import { GAME_REGISTRY } from "./games/registry";
import { AprenderScreen } from "./screens/AprenderScreen";
import { ExploreHubScreen } from "./screens/ExploreHubScreen";
import { FavoritosScreen } from "./screens/FavoritosScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { JugarScreen } from "./screens/JugarScreen";
import { ParentZoneScreen } from "./screens/ParentZoneScreen";
import { WorldScreen } from "./screens/WorldScreen";
import { useProgressStore } from "./store/progressStore";

type Screen =
  | { name: "home" }
  | { name: "jugar" }
  | { name: "explorar" }
  | { name: "exploreScene"; sceneId: string; from: Screen }
  | { name: "aprender" }
  | { name: "favoritos" }
  | { name: "world"; worldId: WorldId }
  | { name: "game"; levelId: string; from: Screen }
  | { name: "parentZone" };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const locale = useProgressStore((state) => state.locale);
  const sensoryMode = useProgressStore((state) => state.sensoryMode);

  const goHome = useCallback(() => setScreen({ name: "home" }), []);

  // Un nivel sin implementar no debe dejar la pantalla en blanco. Se corrige
  // en un efecto y no durante el render: cambiar de estado mientras React
  // renderiza es justo lo que provoca bucles de re-render en StrictMode.
  const missingGame = screen.name === "game" && !GAME_REGISTRY[screen.levelId];
  const missingScene = screen.name === "exploreScene" && !getExploreScene(screen.sceneId);
  useEffect(() => {
    if (missingGame || missingScene) goHome();
  }, [missingGame, missingScene, goHome]);

  return (
    // "calm" apaga el movimiento para niños que se sobreestimulan; "user"
    // respeta prefers-reduced-motion del sistema. framer-motion conserva la
    // opacidad, así que las transiciones siguen siendo comprensibles.
    <MotionConfig reducedMotion={sensoryMode === "calm" ? "always" : "user"}>
      <ErrorBoundary onReset={goHome}>
        <AudioUnlockGate>
          {/* Cada pantalla "aparece" con un rebote en vez de un corte seco: es lo que
              hace que navegar se sienta como una app viva y no como cambiar de página. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={
                screen.name === "game"
                  ? `game-${screen.levelId}`
                  : screen.name === "world"
                    ? `world-${screen.worldId}`
                    : screen.name === "exploreScene"
                      ? `exploreScene-${screen.sceneId}`
                      : screen.name
              }
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              {screen.name === "home" && (
                <HomeScreen
                  onOpenJugar={() => setScreen({ name: "jugar" })}
                  onOpenExplorar={() => setScreen({ name: "explorar" })}
                  onOpenAprender={() => setScreen({ name: "aprender" })}
                  onOpenFavoritos={() => setScreen({ name: "favoritos" })}
                  onOpenParentZone={() => setScreen({ name: "parentZone" })}
                />
              )}

              {screen.name === "jugar" && (
                <JugarScreen onPlay={(levelId) => setScreen({ name: "game", levelId, from: screen })} onBack={goHome} />
              )}

              {screen.name === "explorar" && (
                <ExploreHubScreen
                  onOpenScene={(sceneId) => setScreen({ name: "exploreScene", sceneId, from: screen })}
                  onBack={goHome}
                />
              )}

              {screen.name === "exploreScene" && (
                <ExploreScreen sceneId={screen.sceneId} onExit={() => setScreen(screen.from)} />
              )}

              {screen.name === "aprender" && (
                <AprenderScreen onOpenWorld={(worldId) => setScreen({ name: "world", worldId })} onBack={goHome} />
              )}

              {screen.name === "favoritos" && (
                <FavoritosScreen
                  onPlay={(levelId) => setScreen({ name: "game", levelId, from: screen })}
                  onOpenExploreScene={(sceneId) => setScreen({ name: "exploreScene", sceneId, from: screen })}
                  onBack={goHome}
                />
              )}

              {screen.name === "world" && (
                <WorldScreen
                  worldId={screen.worldId}
                  onPlay={(levelId) => setScreen({ name: "game", levelId, from: screen })}
                  onBack={() => setScreen({ name: "aprender" })}
                />
              )}

              {screen.name === "game" && (
                <GameScreen levelId={screen.levelId} locale={locale} onExit={() => setScreen(screen.from)} />
              )}

              {screen.name === "parentZone" && <ParentZoneScreen onClose={goHome} />}
            </motion.div>
          </AnimatePresence>
        </AudioUnlockGate>
      </ErrorBoundary>
    </MotionConfig>
  );
}

function GameScreen({ levelId, locale, onExit }: { levelId: string; locale: string; onExit: () => void }) {
  const Game = GAME_REGISTRY[levelId];
  if (!Game) return null; // El efecto de App ya está regresando al inicio.
  return <Game locale={locale} onExit={onExit} />;
}

function ExploreScreen({ sceneId, onExit }: { sceneId: string; onExit: () => void }) {
  const scene = getExploreScene(sceneId);
  if (!scene) return null; // El efecto de App ya está regresando al inicio.
  return <ExplorationScene scene={scene} onExit={onExit} />;
}
