import { useState } from "react";
import { AudioUnlockGate } from "./components/AudioUnlockGate";
import { GAME_REGISTRY } from "./games/registry";
import { HomeScreen } from "./screens/HomeScreen";
import { ParentZoneScreen } from "./screens/ParentZoneScreen";
import { useProgressStore } from "./store/progressStore";

type Screen = { name: "home" } | { name: "game"; levelId: string } | { name: "parentZone" };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const locale = useProgressStore((state) => state.locale);

  return (
    <AudioUnlockGate>
      {screen.name === "home" && (
        <HomeScreen
          onPlay={(levelId) => setScreen({ name: "game", levelId })}
          onOpenParentZone={() => setScreen({ name: "parentZone" })}
        />
      )}

      {screen.name === "game" &&
        (() => {
          const Game = GAME_REGISTRY[screen.levelId];
          if (!Game) {
            setScreen({ name: "home" });
            return null;
          }
          return <Game locale={locale} onExit={() => setScreen({ name: "home" })} />;
        })()}

      {screen.name === "parentZone" && <ParentZoneScreen onClose={() => setScreen({ name: "home" })} />}
    </AudioUnlockGate>
  );
}
