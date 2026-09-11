import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";
import { FavoriteHeart } from "../components/FavoriteHeart";
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
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "max(env(safe-area-inset-top), var(--space-md)) var(--space-md) 0",
        }}
      >
        <motion.button
          type="button"
          aria-label={t("common.back")}
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-pill)",
            background: "var(--color-bg-elevated)",
            boxShadow: "var(--shadow-soft)",
            fontSize: "1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⬅️
        </motion.button>
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-text)" }}>{t("hub.favoritos")}</div>
      </header>

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
