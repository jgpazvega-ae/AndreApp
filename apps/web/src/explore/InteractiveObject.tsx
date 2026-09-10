import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playExploreSound } from "../audio/audioEngine";
import { useTimers } from "../games/useTimers";
import { EXPLORE_OBJECT_ART, LeafArt, RippleArt } from "./artwork";
import { objectIdle, objectIdleTransition, objectTap, objectTapTransition, REACTION_TAP_MS } from "./reactions";
import type { InteractiveObjectConfig } from "./types";

interface InteractiveObjectProps {
  config: InteractiveObjectConfig;
  /** Avisa al padre (ExplorationScene) para el chispeo y el compañero — recibe el punto tocado. */
  onTap: (event: { clientX: number; clientY: number }, config: InteractiveObjectConfig) => void;
  /**
   * Contador que otro objeto (o el compañero) incrementa para hacer
   * reaccionar a este SIN que el niño lo haya tocado (Product Vision §35,
   * cadenas de interacción — p. ej. la nube agita el charco). Cambiar de
   * valor reproduce la misma reacción que un toque directo, sin chispeo
   * (el chispeo queda para el toque real).
   */
  externalTrigger?: number;
}

const LEAF_COLORS = ["#4FB89F", "#8CE6C6", "#2E9C89"];

/**
 * Un objeto tocable de una escena Explorar. Sin meta, sin acierto/error
 * (Product Vision §6): cualquier toque produce SU reacción — anima,
 * suena y (si aplica) suelta partículas propias — y vuelve sola a su
 * respiración de reposo. La escena solo necesita darle su config.
 */
export function InteractiveObject({ config, onTap, externalTrigger = 0 }: InteractiveObjectProps) {
  const { t } = useTranslation();
  const [reacting, setReacting] = useState(false);
  const [leaves, setLeaves] = useState<number[]>([]);
  const [ripples, setRipples] = useState<number[]>([]);
  const { after } = useTimers();
  const Art = EXPLORE_OBJECT_ART[config.id];
  const mountedExternal = useRef(false);

  const playReaction = useCallback(() => {
    setReacting(true);
    playExploreSound(config.reaction);
    if (config.reaction === "shed-leaves") {
      const ids = [Date.now(), Date.now() + 1, Date.now() + 2];
      setLeaves(ids);
      after(1100, () => setLeaves([]));
    }
    if (config.reaction === "splash") {
      const ids = [Date.now(), Date.now() + 1];
      setRipples(ids);
      after(900, () => setRipples([]));
    }
    after(REACTION_TAP_MS[config.reaction], () => setReacting(false));
  }, [config, after]);

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      playReaction();
      onTap({ clientX: event.clientX, clientY: event.clientY }, config);
    },
    [config, onTap, playReaction],
  );

  useEffect(() => {
    if (!mountedExternal.current) {
      mountedExternal.current = true;
      return;
    }
    playReaction();
    // Solo debe reaccionar al cambio de la señal, no reprogramarse si cambia playReaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTrigger]);

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

      <AnimatePresence>
        {ripples.map((id, i) => (
          <motion.span
            key={id}
            aria-hidden="true"
            initial={{ opacity: 0.8, scale: 0.3 }}
            animate={{ opacity: [0.8, 0.5, 0], scale: [0.3, 1.3, 1.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "100%",
              height: "100%",
              marginLeft: "-50%",
              marginTop: "-50%",
              pointerEvents: "none",
            }}
          >
            <RippleArt />
          </motion.span>
        ))}
      </AnimatePresence>
    </button>
  );
}
