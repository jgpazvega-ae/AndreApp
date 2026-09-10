import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";
import { FavoriteHeart } from "../components/FavoriteHeart";
import { getWorld } from "../data/worlds";
import { useProgressStore } from "../store/progressStore";

interface JugarScreenProps {
  onPlay: (levelId: string) => void;
  onBack: () => void;
}

/**
 * Pilar Jugar (Product Vision §2, §17): todo lo jugable en una sola
 * cuadrícula, sin agrupar por mundo — para el niño que ya sabe qué quiere
 * jugar y no necesita pasar por el mapa curricular de Aprender.
 */
export function JugarScreen({ onPlay, onBack }: JugarScreenProps) {
  const { t } = useTranslation();
  const levelsProgress = useProgressStore((state) => state.levels);
  const playable = CURRICULUM_LEVELS.filter((level) => level.status === "playable").sort((a, b) => a.order - b.order);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--color-bg)", paddingBottom: "var(--space-xl)" }}>
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
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-text)" }}>{t("hub.jugar")}</div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "var(--space-sm)",
          padding: "var(--space-lg) var(--space-md) 0",
        }}
      >
        {playable.map((level, idx) => (
          <div key={level.id} style={{ position: "relative" }}>
            <FavoriteHeart id={level.id} />
            <BigButton
              icon={level.icon}
              label={t(level.titleKey)}
              gradient={getWorld(level.world ?? "estacion").gradient}
              delayIndex={idx}
              roundsCompleted={levelsProgress[level.id]?.roundsCompleted ?? 0}
              onTap={() => onPlay(level.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
