import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { useIdleHint } from "../useIdleHint";

const PRAISE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

const BACKGROUND = "linear-gradient(160deg, #FFD3B0 0%, #FF9466 100%)";

/** Límites seguros en % del área de juego (el punto es el centro del sprite). */
const BOUNDS = { xMin: 18, xMax: 82, yMin: 24, yMax: 72 };

interface Position {
  x: number;
  y: number;
}

function randomPosition(): Position {
  return {
    x: BOUNDS.xMin + Math.random() * (BOUNDS.xMax - BOUNDS.xMin),
    y: BOUNDS.yMin + Math.random() * (BOUNDS.yMax - BOUNDS.yMin),
  };
}

type Phase = "static" | "slow" | "medium";

function phaseFor(catchCount: number): Phase {
  if (catchCount < 2) return "static";
  if (catchCount < 5) return "slow";
  return "medium";
}

const MOVE_INTERVAL_MS: Record<Phase, number | null> = { static: null, slow: 2400, medium: 1500 };

interface N2TocaAlObjetivoProps {
  locale: string;
  onExit: () => void;
}

/**
 * N2 · Toca al objetivo (docs/CURRICULUM.md ficha N2).
 * La mascota aparece quieta (solo "respira"); al atraparla reaparece en
 * otro lugar y, tras un par de aciertos, empieza a desplazarse (más rápido
 * conforme se acierta más) — dirigir la atención y apuntar. Sin estado de
 * fallo: no hay penalización por no tocar, solo una invitación más notoria.
 */
export function N2TocaAlObjetivo({ locale, onExit }: N2TocaAlObjetivoProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<Position>(() => randomPosition());
  const [catchCount, setCatchCount] = useState(0);
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n2", {
    locale,
    welcomeFile: "n2-welcome.mp3",
  });
  const { idle, resetIdle } = useIdleHint();

  const phase = phaseFor(catchCount);
  const moveIntervalMs = MOVE_INTERVAL_MS[phase];

  // Deriva: mientras la fase tenga movimiento, cambia el destino cada moveIntervalMs.
  useEffect(() => {
    if (!moveIntervalMs) return;
    const id = setInterval(() => setPosition(randomPosition()), moveIntervalMs);
    return () => clearInterval(id);
  }, [moveIntervalMs]);

  const handleCatch = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      resetIdle();
      celebrate(event);
      playVoiceClip(locale, pickRandom(PRAISE_FILES));
      setCatchCount((c) => c + 1);
      setPosition(randomPosition());
    },
    [locale, resetIdle, celebrate],
  );

  return (
    <GameShell
      levelId="n2"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <motion.div
        initial={false}
        animate={{ left: `${position.x}%`, top: `${position.y}%` }}
        transition={{ duration: (moveIntervalMs ?? 600) / 1000, ease: "easeInOut" }}
        style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
      >
        <AnimatePresence>
          {idle && (
            <motion.div
              key="glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.25, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label={t("a11y.target")}
          onPointerDown={handleCatch}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.85 }}
          style={{
            position: "relative",
            width: 148,
            height: 148,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <img
            src={asset("illustrations/mascot.png")}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 16px rgba(120,60,10,0.3))",
            }}
          />
        </motion.button>
      </motion.div>
    </GameShell>
  );
}
