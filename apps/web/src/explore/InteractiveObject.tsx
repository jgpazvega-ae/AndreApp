import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playExploreSound } from "../audio/audioEngine";
import { useTimers } from "../games/useTimers";
import { EXPLORE_OBJECT_ART, LeafArt, RippleArt, SparkleArt } from "./artwork";
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
   * (el chispeo queda para el toque real). Si el objeto `startsHidden`, la
   * PRIMERA vez que cambia lo revela en vez de hacerlo reaccionar.
   */
  externalTrigger?: number;
  /** Si empieza visible (true) o debe esperar a su primer externalTrigger para aparecer. */
  initiallyRevealed?: boolean;
}

const LEAF_COLORS = ["#4FB89F", "#8CE6C6", "#2E9C89"];

/**
 * Un objeto tocable de una escena Explorar. Sin meta, sin acierto/error
 * (Product Vision §6): cualquier toque produce SU reacción — anima,
 * suena y (si aplica) suelta partículas propias — y vuelve sola a su
 * respiración de reposo. La escena solo necesita darle su config.
 */
export function InteractiveObject({
  config,
  onTap,
  externalTrigger = 0,
  initiallyRevealed = true,
}: InteractiveObjectProps) {
  const { t } = useTranslation();
  const [reacting, setReacting] = useState(false);
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const [leaves, setLeaves] = useState<number[]>([]);
  const [ripples, setRipples] = useState<number[]>([]);
  const [sparkles, setSparkles] = useState<number[]>([]);
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
    if (config.reaction === "sparkle") {
      const ids = [Date.now(), Date.now() + 1, Date.now() + 2];
      setSparkles(ids);
      after(700, () => setSparkles([]));
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
    // Un objeto que empezaba oculto (ver startsHidden) se REVELA la primera
    // vez que lo dispara su cadena, en vez de reaccionar: aparecer ES su
    // reacción. De ahí en adelante se comporta como cualquier objeto tocable.
    if (!revealed) {
      setRevealed(true);
      playExploreSound(config.reaction);
      return;
    }
    playReaction();
    // Solo debe reaccionar al cambio de la señal, no reprogramarse si cambia playReaction/revealed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTrigger]);

  if (!revealed) return null;

  const positionStyle = {
    position: "absolute" as const,
    left: `${config.x}%`,
    top: `${config.y}%`,
    width: `${config.size}rem`,
    height: `${config.size}rem`,
    transform: "translate(-50%, -50%)",
  };

  // Objetos de arrastre (cometa/columpio): gesto propio, sin el sistema de
  // toque/reacción de arriba — seguir el dedo y volver es SU reacción.
  if (config.drag) {
    const isKite = config.drag === "kite";
    const handleDragStart = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      playExploreSound(config.reaction);
      onTap({ clientX: info.point.x, clientY: info.point.y }, config);
    };
    return (
      <motion.div
        role="img"
        aria-label={t(config.nameKey)}
        drag={isKite ? true : "x"}
        dragConstraints={isKite ? undefined : { left: -36, right: 36 }}
        dragElastic={isKite ? 0.5 : 0.25}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: isKite ? 260 : 420, bounceDamping: isKite ? 9 : 7 }}
        whileDrag={{ scale: 1.08 }}
        onDragStart={handleDragStart}
        style={{ ...positionStyle, touchAction: "none", cursor: "grab" }}
      >
        <motion.div
          animate={objectIdle(config.reaction)}
          transition={objectIdleTransition(config.reaction)}
          style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 10px rgba(58,46,34,0.18))" }}
        >
          {Art && <Art />}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={t(config.nameKey)}
      onPointerDown={handleTap}
      initial={initiallyRevealed ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      style={{
        ...positionStyle,
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

      <AnimatePresence>
        {sparkles.map((id, i) => {
          const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
          return (
            <motion.span
              key={id}
              aria-hidden="true"
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.3 }}
              animate={{
                opacity: [1, 1, 0],
                x: Math.cos(angle) * 30,
                y: Math.sin(angle) * 30 - 10,
                scale: [0.3, 1, 0.7],
                rotate: 90,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              style={{ position: "absolute", left: "50%", top: "30%", width: 14, height: 14, pointerEvents: "none" }}
            >
              <SparkleArt />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </motion.button>
  );
}
