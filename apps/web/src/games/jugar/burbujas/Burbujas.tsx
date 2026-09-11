import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playJugarSound } from "../../../audio/audioEngine";
import { GameShell } from "../../../components/GameShell";
import { useGameSession } from "../../useGameSession";
import { useTimers } from "../../useTimers";
import { BubbleArt } from "../jugarArt";

const BACKGROUND = "linear-gradient(160deg, #BEE9FF 0%, #E8F7FF 55%, #DFF6EC 100%)";
const COLORS = ["#7EC8F0", "#8CE6C6", "#FFD93D", "#F58BC0", "#B0A8FF", "#FFB03B"];
const BOUNDS = { xMin: 14, xMax: 86, yMin: 16, yMax: 78 };
/** Cuántas burbujas hay a la vez, según qué tan bien le está yendo (dificultad adaptativa). */
const BUBBLE_COUNT_BY_LEVEL: Record<1 | 2 | 3, number> = { 1: 4, 2: 5, 3: 6 };

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  bobDuration: number;
}

function randomBubble(id: number): Bubble {
  return {
    id,
    x: BOUNDS.xMin + Math.random() * (BOUNDS.xMax - BOUNDS.xMin),
    y: BOUNDS.yMin + Math.random() * (BOUNDS.yMax - BOUNDS.yMin),
    size: 4.2 + Math.random() * 2.6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    bobDuration: 2.2 + Math.random() * 1.4,
  };
}

interface BurbujasProps {
  locale: string;
  onExit: () => void;
}

/**
 * Burbujas (Jugar §Game 01): tocar cualquier burbuja la explota — partículas,
 * sonido, y una nueva aparece en otro lugar. Sin meta ni error: cada toque
 * es un acierto, como N1, pero con VARIOS objetivos vivos a la vez en vez
 * de uno solo — la mecánica que lo distingue dentro de la biblioteca.
 */
export function Burbujas({ locale, onExit }: BurbujasProps) {
  const { t } = useTranslation();
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound, difficultyLevel } = useGameSession(
    "burbujas",
    { locale },
  );
  const nextId = useRef(0);
  const targetCount = BUBBLE_COUNT_BY_LEVEL[difficultyLevel as 1 | 2 | 3] ?? 4;
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    Array.from({ length: targetCount }, () => randomBubble(nextId.current++)),
  );
  const { after } = useTimers();

  const handlePop = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, bubbleId: number) => {
      event.stopPropagation();
      playJugarSound("pop");
      celebrate({ clientX: event.clientX, clientY: event.clientY });
      setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
      after(220, () => {
        setBubbles((prev) => (prev.length >= targetCount ? prev : [...prev, randomBubble(nextId.current++)]));
      });
    },
    [celebrate, after, targetCount],
  );

  return (
    <GameShell
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            type="button"
            aria-label={t("a11y.target")}
            onPointerDown={(event) => handlePop(event, bubble.id)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -12, 0], x: [0, 4, 0] }}
            exit={{ scale: 1.7, opacity: 0, transition: { duration: 0.18 } }}
            transition={{
              scale: { type: "spring", stiffness: 260, damping: 16 },
              opacity: { duration: 0.25 },
              y: { duration: bubble.bobDuration, repeat: Infinity, ease: "easeInOut" },
              x: { duration: bubble.bobDuration * 1.3, repeat: Infinity, ease: "easeInOut" },
            }}
            whileTap={{ scale: 1.15 }}
            style={{
              position: "absolute",
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}rem`,
              height: `${bubble.size}rem`,
              transform: "translate(-50%, -50%)",
              background: "none",
              border: "none",
              padding: 0,
              touchAction: "manipulation",
            }}
          >
            <BubbleArt color={bubble.color} />
          </motion.button>
        ))}
      </AnimatePresence>
    </GameShell>
  );
}
