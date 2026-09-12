import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playChime } from "../audio/audioEngine";
import { BigButton } from "../components/BigButton";
import { FavoriteHeart } from "../components/FavoriteHeart";
import { HubHeader, type HubHeaderIcon } from "../components/HubHeader";
import { EXPLORE_CATALOG } from "../data/exploreCatalog";

interface ExploreHubScreenProps {
  onOpenScene: (sceneId: string) => void;
  onBack: () => void;
}

const COMING_SOON_TOAST_MS = 1800;
const EXPLORE_GRADIENT: [string, string] = ["#8CE6C6", "#2E9C89"];

/** Naturaleza, no juguetes: distingue este encabezado del de Jugar aunque
 * ambos usen el mismo componente. */
const HERO_ICONS: HubHeaderIcon[] = [
  { icon: "🦋", left: "44%", top: "18%", size: "1.4rem", duration: 3.4 },
  { icon: "🌸", left: "78%", top: "58%", size: "1.3rem", duration: 3 },
  { icon: "🍃", left: "90%", top: "20%", size: "1.5rem", duration: 3.8 },
];

/**
 * Pilar Explorar (Product Vision §2, §18): selector de escenas de mundo
 * abierto. Hoy solo "Parque" está construido — el resto se muestra con el
 * mismo lenguaje de "muy pronto" que WorldScreen usa para niveles sin
 * construir, para no prometer algo que todavía no existe.
 */
export function ExploreHubScreen({ onOpenScene, onBack }: ExploreHubScreenProps) {
  const { t } = useTranslation();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLockedTap = () => {
    playChime();
    setShowComingSoon(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowComingSoon(false), COMING_SOON_TOAST_MS);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

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
      <HubHeader title={t("hub.explorar")} onBack={onBack} gradient={EXPLORE_GRADIENT} icons={HERO_ICONS} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "var(--space-md)",
          padding: "var(--space-lg) var(--space-md) 0",
        }}
      >
        {EXPLORE_CATALOG.map((scene, idx) => (
          <div key={scene.id} style={{ position: "relative" }}>
            {scene.built && <FavoriteHeart id={`explore:${scene.id}`} />}
            <BigButton
              icon={scene.built ? "🌳" : "⏳"}
              label={t(scene.nameKey)}
              gradient={EXPLORE_GRADIENT}
              locked={!scene.built}
              disabled={!scene.built}
              delayIndex={idx}
              onTap={() => onOpenScene(scene.id)}
              onLockedTap={handleLockedTap}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            key="explore-coming-soon-toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            style={{
              position: "fixed",
              left: "50%",
              bottom: "max(env(safe-area-inset-bottom), 20px)",
              transform: "translateX(-50%)",
              zIndex: 30,
              background: "var(--color-text)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "var(--radius-pill)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: "0.9rem",
              boxShadow: "var(--shadow-soft)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden="true">🚧</span>
            {t("common.comingSoon")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
