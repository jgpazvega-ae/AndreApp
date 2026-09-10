import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { playExploreSound } from "../audio/audioEngine";
import { useTimers } from "../games/useTimers";
import { EXPLORE_OBJECT_ART, LeafArt } from "./artwork";
import { objectIdle, objectIdleTransition, objectTap, objectTapTransition, REACTION_TAP_MS } from "./reactions";
import type { InteractiveObjectConfig } from "./types";

interface InteractiveObjectProps {
  config: InteractiveObjectConfig;
  /** Avisa al padre (ExplorationScene) para el chispeo y el compañero — recibe el punto tocado. */
  onTap: (event: { clientX: number; clientY: number }, config: InteractiveObjectConfig) => void;
}

const LEAF_COLORS = ["#4FB89F", "#8CE6C6", "#2E9C89"];

/**
 * Un objeto tocable de una escena Explorar. Sin meta, sin acierto/error
 * (Product Vision §6): cualquier toque produce SU reacción — anima,
 * suena y (si aplica) suelta partículas propias — y vuelve sola a su
 * respiración de reposo. La escena solo necesita darle su config.
 */
export function InteractiveObject({ config, onTap }: InteractiveObjectProps) {
  const { t } = useTranslation();
  const [reacting, setReacting] = useState(false);
  const [leaves, setLeaves] = useState<number[]>([]);
  const { after } = useTimers();
  const Art = EXPLORE_OBJECT_ART[config.id];

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setReacting(true);
      playExploreSound(config.reaction);
      onTap({ clientX: event.clientX, clientY: event.clientY }, config);
      if (config.reaction === "shed-leaves") {
        const ids = [Date.now(), Date.now() + 1, Date.now() + 2];
        setLeaves(ids);
        after(1100, () => setLeaves([]));
      }
      after(REACTION_TAP_MS[config.reaction], () => setReacting(false));
    },
    [config, onTap, after],
  );

  return (
    <button
      type="button"
      aria-label={t(config.nameKey)}
      onPointerDown={handleTap}
      style={{
        position: "absolute",
        left: `${config.x}%`,
        top: `${config.y}%`,
        width: `${config.size}rem`,
        height: `${config.size}rem`,
        transform: "translate(-50%, -50%)",
        background: "none",
        border: "none",
        padding: 0,
        touchAction: "manipulation",
      }}
    >
      <motion.div
        animate={reacting ? objectTap(config.reaction) : objectIdle(config.reaction)}
        transition={reacting ? objectTapTransition(config.reaction) : objectIdleTransition(config.reaction)}
        style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 10px rgba(58,46,34,0.18))" }}
      >
        {Art && <Art />}
      </motion.div>

      <AnimatePresence>
        {leaves.map((id, i) => (
          <motion.span
            key={id}
            aria-hidden="true"
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: [1, 1, 0], x: (i - 1) * 26, y: 70, rotate: 180 + i * 60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: i * 0.08, ease: "easeIn" }}
            style={{ position: "absolute", left: "50%", top: "60%", width: 18, height: 18, pointerEvents: "none" }}
          >
            <LeafArt color={LEAF_COLORS[i % LEAF_COLORS.length]} />
          </motion.span>
        ))}
      </AnimatePresence>
    </button>
  );
}
