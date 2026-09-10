import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS, type WorldId } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";
import { WORLDS } from "../data/worlds";

interface AprenderScreenProps {
  onOpenWorld: (worldId: WorldId) => void;
  onBack: () => void;
}

/**
 * Pilar Aprender (Product Vision §2): el mapa de mundos que antes vivía
 * directo en HomeScreen. Se mudó de lugar, no de forma — mismo BigButton,
 * mismos 3 mundos, mismo WorldScreen detrás — para no arriesgar nada de lo
 * que ya funcionaba (Product Vision §28: "no reescribir innecesariamente").
 */
export function AprenderScreen({ onOpenWorld, onBack }: AprenderScreenProps) {
  const { t } = useTranslation();

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
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-text)" }}>{t("aprender.title")}</div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "var(--space-md)",
          padding: "var(--space-lg) var(--space-md) 0",
        }}
      >
        {WORLDS.map((world, i) => (
          <BigButton
            key={world.id}
            icon={world.icon}
            label={t(world.nameKey)}
            gradient={world.gradient}
            delayIndex={i}
            onTap={() => onOpenWorld(world.id)}
          />
        ))}
      </div>

      <footer
        style={{
          padding: "var(--space-md)",
          color: "var(--color-text-muted)",
          fontSize: "0.75rem",
          textAlign: "center",
        }}
      >
        {t("home.levelsReady", {
          done: CURRICULUM_LEVELS.filter((l) => l.status === "playable").length,
          total: CURRICULUM_LEVELS.length,
        })}
      </footer>
    </div>
  );
}
