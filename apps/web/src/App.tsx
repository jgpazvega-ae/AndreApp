import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { AudioUnlockGate } from "./components/AudioUnlockGate";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GAME_REGISTRY } from "./games/registry";
import { HomeScreen } from "./screens/HomeScreen";
import { ParentZoneScreen } from "./screens/ParentZoneScreen";
import { useProgressStore } from "./store/progressStore";

type Screen = { name: "home" } | { name: "game"; levelId: string } | { name: "parentZone" };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const locale = useProgressStore((state) => state.locale);
  const sensoryMode = useProgressStore((state) => state.sensoryMode);

  const goHome = useCallback(() => setScreen({ name: "home" }), []);

  // Un nivel sin implementar no debe dejar la pantalla en blanco. Se corrige
  // en un efecto y no durante el render: cambiar de estado mientras React
  // renderiza es justo lo que provoca bucles de re-render en StrictMode.
  const missingGame = screen.name === "game" && !GAME_REGISTRY[screen.levelId];
  useEffect(() => {
    if (missingGame) goHome();
  }, [missingGame, goHome]);

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
              key={screen.name === "game" ? `game-${screen.levelId}` : screen.name}
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              {screen.name === "home" && (
                <HomeScreen
                  onPlay={(levelId) => setScreen({ name: "game", levelId })}
                  onOpenParentZone={() => setScreen({ name: "parentZone" })}
                />
              )}

              {screen.name === "game" && <GameScreen levelId={screen.levelId} locale={locale} onExit={goHome} />}

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
