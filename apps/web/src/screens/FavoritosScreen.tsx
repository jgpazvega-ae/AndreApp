import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";
import { FavoriteHeart } from "../components/FavoriteHeart";
import { HubHeader, type HubHeaderIcon } from "../components/HubHeader";
import { EXPLORE_CATALOG } from "../data/exploreCatalog";
import { JUGAR_GAMES } from "../data/jugarGames";
import { getWorld } from "../data/worlds";
import { useProgressStore } from "../store/progressStore";

interface FavoritosScreenProps {
  onPlay: (levelId: string) => void;
  onOpenExploreScene: (sceneId: string) => void;
  onBack: () => void;
}

const EXPLORE_PREFIX = "explore:";
/** Mismo gradiente que el tile "Favoritos" de Home (§PILLARS). */
const FAVORITOS_GRADIENT: [string, string] = ["#F58BC0", "#E0568F"];
const HERO_ICONS: HubHeaderIcon[] = [
  { icon: "💕", left: "42%", top: "60%", size: "1.4rem", duration: 3.2 },
  { icon: "✨", left: "78%", top: "18%", size: "1.2rem", duration: 2.6 },
  { icon: "🎀", left: "90%", top: "55%", size: "1.3rem", duration: 3.6 },
];

/**
 * Pilar Favoritos (Product Vision §17): lo que el niño (o el padre, en su
 * nombre) marcó con el corazón — niveles de Jugar/Aprender y escenas de
 * Explorar mezclados, porque para el niño no son catálogos distintos, son
 * "las cosas que me gustan".
 */
export function FavoritosScreen({ onPlay, onOpenExploreScene, onBack }: FavoritosScreenProps) {
  const { t } = useTranslation();
  const favoriteIds = useProgressStore((state) => state.favoriteIds);
  const levelsProgress = useProgressStore((state) => state.levels);

  const favoriteLevels = CURRICULUM_LEVELS.filter((level) => favoriteIds.includes(level.id));
  const favoriteGames = JUGAR_GAMES.filter((game) => favoriteIds.includes(game.id));
  const favoriteScenes = EXPLORE_CATALOG.filter(
    (scene) => scene.built && favoriteIds.includes(`${EXPLORE_PREFIX}${scene.id}`),
  );
  const isEmpty = favoriteLevels.length === 0 && favoriteGames.length === 0 && favoriteScenes.length === 0;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        paddingBottom: "var(--space-xl)",
      }}
    >
      <HubHeader title={t("hub.favoritos")} onBack={onBack} gradient={FAVORITOS_GRADIENT} icons={HERO_ICONS} />

      {isEmpty ? (
        <p
          style={{
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "var(--space-xl) var(--space-lg) 0",
          }}
        >
          {t("favoritos.empty")}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "var(--space-sm)",
            padding: "var(--space-lg) var(--space-md) 0",
          }}
        >
          {favoriteScenes.map((scene, idx) => (
            <div key={`explore:${scene.id}`} style={{ position: "relative" }}>
              <FavoriteHeart id={`${EXPLORE_PREFIX}${scene.id}`} />
              <BigButton
                icon="🌈"
                label={t(scene.nameKey)}
                gradient={["#8CE6C6", "#2E9C89"]}
                delayIndex={idx}
                onTap={() => onOpenExploreScene(scene.id)}
              />
            </div>
          ))}
          {favoriteGames.map((game, idx) => (
            <div key={game.id} style={{ position: "relative" }}>
              <FavoriteHeart id={game.id} />
              <BigButton
                icon={game.icon}
                label={t(game.titleKey)}
                gradient={game.gradient}
                delayIndex={favoriteScenes.length + idx}
                roundsCompleted={levelsProgress[game.id]?.roundsCompleted ?? 0}
                onTap={() => onPlay(game.id)}
              />
            </div>
          ))}
          {favoriteLevels.map((level, idx) => (
            <div key={level.id} style={{ position: "relative" }}>
              <FavoriteHeart id={level.id} />
              <BigButton
                icon={level.icon}
                label={t(level.titleKey)}
                gradient={getWorld(level.world ?? "estacion").gradient}
                delayIndex={favoriteScenes.length + favoriteGames.length + idx}
                roundsCompleted={levelsProgress[level.id]?.roundsCompleted ?? 0}
                onTap={() => onPlay(level.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
