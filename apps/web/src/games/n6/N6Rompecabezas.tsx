import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { pickRandom, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { ShapeIcon, type ShapeType } from "./ShapeIcon";

const ALL_SHAPES: [ShapeType, ...ShapeType[]] = ["circle", "square", "triangle", "star"];

const BACKGROUND = "linear-gradient(160deg, #FFF0E0 0%, #FFD6A8 100%)";
const SHAKE_MS = 400;
const ROUND_COMPLETE_DELAY_MS = 1600;

/** Reutiliza los elogios de proceso de N2 para celebrar el rompecabezas completo. */
const ROUND_COMPLETE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

/** Empieza en 2 piezas y escala a 4 conforme se completan rompecabezas (docs/CURRICULUM.md ficha N6). */
function piecesForRound(roundIndex: number): number {
  return Math.min(2 + roundIndex, ALL_SHAPES.length);
}

function newRound(roundIndex: number): ShapeType[] {
  return shuffle(ALL_SHAPES).slice(0, piecesForRound(roundIndex));
}

interface N6RompecabezasProps {
  locale: string;
  onExit: () => void;
}

/**
 * N6 · Rompecabezas 2-4 piezas (docs/CURRICULUM.md ficha N6).
 * Encajar siluetas grandes: se toca una pieza y luego su hueco. Solo entra
 * la correcta ("imán generoso" = tolerancia total, cualquier toque en el
 * hueco cuenta, no hay precisión de arrastre que fallar). Sin drag —
 * alternativa tocar-tocar consistente con el resto del currículo.
 */
export function N6Rompecabezas({ locale, onExit }: N6RompecabezasProps) {
  const { t } = useTranslation();
  const [roundIndex, setRoundIndex] = useState(0);
  const [shapes, setShapes] = useState<ShapeType[]>(() => newRound(0));
  const [slotOrder, setSlotOrder] = useState<ShapeType[]>(() => shuffle(shapes));
  const [pieceOrder, setPieceOrder] = useState<ShapeType[]>(() => shuffle(shapes));
  const [placed, setPlaced] = useState<Set<ShapeType>>(new Set());
  const [selected, setSelected] = useState<ShapeType | null>(null);
  const [shakeSlot, setShakeSlot] = useState<ShapeType | null>(null);
  const { acknowledgeTap, celebrate, celebrateSignal, confettiField } = useGameSession("n6", {
    locale,
    welcomeFile: "n6-welcome.mp3",
  });

  // Rompecabezas completo: celebrar y empezar el siguiente, con una pieza más.
  useEffect(() => {
    if (placed.size === 0 || placed.size < shapes.length) return;
    const praise = setTimeout(() => playVoiceClip(locale, pickRandom(ROUND_COMPLETE_FILES)), 200);
    const next = setTimeout(() => {
      const nextRoundIndex = roundIndex + 1;
      const nextShapes = newRound(nextRoundIndex);
      setRoundIndex(nextRoundIndex);
      setShapes(nextShapes);
      setSlotOrder(shuffle(nextShapes));
      setPieceOrder(shuffle(nextShapes));
      setPlaced(new Set());
      setSelected(null);
    }, ROUND_COMPLETE_DELAY_MS);
    return () => {
      clearTimeout(praise);
      clearTimeout(next);
    };
  }, [placed, shapes, roundIndex, locale]);

  const handleTapPiece = useCallback(
    (shape: ShapeType) => {
      acknowledgeTap();
      setSelected(shape);
    },
    [acknowledgeTap],
  );

  const handleTapSlot = useCallback(
    (shape: ShapeType, event: React.PointerEvent<HTMLButtonElement>) => {
      if (placed.has(shape) || !selected) return;

      if (selected === shape) {
        celebrate(event);
        setPlaced((prev) => new Set(prev).add(shape));
        setSelected(null);
      } else {
        // No entra: se sacude el hueco, sin sonido negativo, y la pieza sigue seleccionada.
        setShakeSlot(shape);
        setTimeout(() => setShakeSlot(null), SHAKE_MS);
      }
    },
    [selected, placed, celebrate],
  );

  return (
    <GameShell
      levelId="n6"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-md)",
        }}
      >
        {slotOrder.map((shape) => (
          <motion.button
            key={shape}
            type="button"
            aria-label={t("a11y.puzzleSlot")}
            onPointerDown={(e) => handleTapSlot(shape, e)}
            animate={shakeSlot === shape ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
            transition={{ duration: SHAKE_MS / 1000 }}
            style={{ width: "22vw", maxWidth: 96, aspectRatio: "1", background: "none", border: "none", padding: 0 }}
          >
            <ShapeIcon type={shape} variant={placed.has(shape) ? "piece" : "slot"} />
          </motion.button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-md)",
          padding: "0 var(--space-md)",
        }}
      >
        {pieceOrder
          .filter((shape) => !placed.has(shape))
          .map((shape) => (
            <motion.button
              key={shape}
              type="button"
              aria-label={t("a11y.puzzlePiece")}
              onPointerDown={() => handleTapPiece(shape)}
              whileTap={{ scale: 0.9 }}
              animate={
                selected === shape
                  ? {
                      scale: [1, 1.12, 1],
                      filter: [
                        "drop-shadow(0 0 0 rgba(255,255,255,0))",
                        "drop-shadow(0 0 14px rgba(255,255,255,0.9))",
                        "drop-shadow(0 0 0 rgba(255,255,255,0))",
                      ],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.9, repeat: selected === shape ? Infinity : 0, ease: "easeInOut" }}
              style={{
                width: "22vw",
                maxWidth: 96,
                aspectRatio: "1",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <ShapeIcon type={shape} variant="piece" />
            </motion.button>
          ))}
      </div>
    </GameShell>
  );
}
