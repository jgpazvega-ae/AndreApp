import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLevelsByWorld, type WorldId } from "@andreapp/curriculum";
import { playChime } from "../audio/audioEngine";
import { BigButton } from "../components/BigButton";
import { getBuddy } from "../data/buddies";
import { getWorld } from "../data/worlds";
import { useProgressStore } from "../store/progressStore";

/** Cuánto queda visible el avisito de "muy pronto" tras tocar un nivel aún no construido. */
const COMING_SOON_TOAST_MS = 1800;

interface WorldScreenProps {
  worldId: WorldId;
  onPlay: (levelId: string) => void;
  onBack: () => void;
}

/**
 * Mundo: la pantalla intermedia entre el mapa de mundos (HomeScreen) y un
 * nivel. Antes los 22 niveles vivían en una sola cuadrícula plana por etapa;
 * ahora cada uno pertenece a un mundo narrativo (Blueprint v1 §"Arquitectura
 * de mundos") recibido por su propio compañero anfitrión.
 */
export function WorldScreen({ worldId, onPlay, onBack }: WorldScreenProps) {
  const { t } = useTranslation();
  const levelsProgress = useProgressStore((state) => state.levels);
  const world = getWorld(worldId);
  const host = getBuddy(world.hostBuddy);
  const levels = getLevelsByWorld(worldId);

  const [showComingSoon, setShowComingSoon] = useState(false);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLockedTap = () => {
    playChime();
    setShowComingSoon(true);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setShowComingSoon(false), COMING_SOON_TOAST_MS);
  };
  useEffect(
    () => () => {
      if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
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
      <div
        style={{
          position: "relative",
          padding: "max(env(safe-area-inset-top), var(--space-md)) var(--space-md) var(--space-lg)",
          background: `linear-gradient(160deg, ${world.gradient[0]} 0%, ${world.gradient[1]} 100%)`,
          borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <motion.button
            type="button"
            aria-label={t("common.back")}
            onClick={onBack}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-pill)",
              background: "rgba(255,255,255,0.85)",
              fontSize: "1.2rem",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            ←
          </motion.button>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
            {t(world.nameKey)}
          </div>
          <div style={{ width: 44 }} aria-hidden="true" />
        </div>

        <motion.img
          src={host.image}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
          }}
          style={{
            display: "block",
            margin: "var(--space-sm) auto 0",
            width: "min(30vw, 120px)",
            filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.22))",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
          gap: "var(--space-sm)",
          padding: "var(--space-lg) var(--space-md) 0",
        }}
      >
        {levels.map((level, idx) => {
          const isPlayable = level.status === "playable";
          return (
            <BigButton
              key={level.id}
              icon={isPlayable ? level.icon : level.free ? "⏳" : "🔒"}
              label={t(level.titleKey)}
              gradient={world.gradient}
              locked={!isPlayable}
              disabled={!isPlayable}
              delayIndex={idx}
              roundsCompleted={levelsProgress[level.id]?.roundsCompleted ?? 0}
              onTap={() => onPlay(level.id)}
              onLockedTap={handleLockedTap}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            key="coming-soon-toast"
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
