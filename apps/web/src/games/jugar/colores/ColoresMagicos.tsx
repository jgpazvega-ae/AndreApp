import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playJugarSound } from "../../../audio/audioEngine";
import { GameShell } from "../../../components/GameShell";
import { pickRandom } from "../../../utils/random";
import { useGameSession } from "../../useGameSession";
import { useTimers } from "../../useTimers";
import { CircleShapeArt, HeartArt, StarArt } from "../jugarArt";

const BACKGROUND = "linear-gradient(160deg, #FFF3E0 0%, #FFE0EC 100%)";
const PALETTE = [
  { name: "azul", color: "#4FA8E8" },
  { name: "verde", color: "#3FBE8E" },
  { name: "amarillo", color: "#F5C542" },
  { name: "rosa", color: "#F06BAF" },
  { name: "morado", color: "#9B7FEE" },
] as const;
const SHAPES = [CircleShapeArt, StarArt, HeartArt] as const;
const BOUNDS = { xMin: 12, xMax: 88, yMin: 32, yMax: 82 };
const FIELD_SIZE_BY_LEVEL: Record<1 | 2 | 3, number> = { 1: 6, 2: 7, 3: 8 };
const MATCH_COUNT_BY_LEVEL: Record<1 | 2 | 3, number> = { 1: 2, 2: 3, 3: 3 };

interface Piece {
  id: number;
  x: number;
  y: number;
  colorIdx: number;
  Shape: (typeof SHAPES)[number];
}

function buildField(targetColorIdx: number, matchCount: number, total: number, startId: number): Piece[] {
  const pieces: Piece[] = [];
  let id = startId;
  for (let i = 0; i < matchCount; i++) {
    pieces.push({ id: id++, x: 0, y: 0, colorIdx: targetColorIdx, Shape: pickRandom(SHAPES) });
  }
  while (pieces.length < total) {
    const otherIdx = Math.floor(Math.random() * PALETTE.length);
    if (otherIdx === targetColorIdx) continue;
    pieces.push({ id: id++, x: 0, y: 0, colorIdx: otherIdx, Shape: pickRandom(SHAPES) });
  }
  // Posiciones repartidas en una grilla suelta con desorden, para que no se amontonen.
  const cols = 4;
  const shuffled = pieces
    .map((p) => ({ p, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ p }, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = (BOUNDS.xMax - BOUNDS.xMin) / cols;
      const cellH = (BOUNDS.yMax - BOUNDS.yMin) / Math.ceil(total / cols);
      return {
        ...p,
        x: BOUNDS.xMin + cellW * col + cellW * 0.5 + (Math.random() - 0.5) * cellW * 0.3,
        y: BOUNDS.yMin + cellH * row + cellH * 0.5 + (Math.random() - 0.5) * cellH * 0.3,
      };
    });
  return shuffled;
}

interface ColoresMagicosProps {
  locale: string;
  onExit: () => void;
}

/**
 * Colores Mágicos (Jugar §Game 03): un color objetivo grande arriba, un
 * campo de formas mezcladas abajo — tocar todas las del color correcto.
 * A diferencia de N4 (clasificar hacia zonas), aquí no hay zonas: es
 * búsqueda visual y atención sostenida ("encuéntralas todas"), no
 * clasificación. Ningún toque equivocado penaliza, solo se sacude.
 */
export function ColoresMagicos({ locale, onExit }: ColoresMagicosProps) {
  const { t } = useTranslation();
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound, difficultyLevel } = useGameSession(
    "colores",
    { locale, welcomeFile: "jugar-colores-welcome.mp3" },
  );
  const level = (difficultyLevel as 1 | 2 | 3) ?? 1;
  const nextId = useRef(0);
  const [targetIdx, setTargetIdx] = useState(() => Math.floor(Math.random() * PALETTE.length));
  const [pieces, setPieces] = useState<Piece[]>(() =>
    buildField(targetIdx, MATCH_COUNT_BY_LEVEL[level] ?? 2, FIELD_SIZE_BY_LEVEL[level] ?? 6, nextId.current),
  );
  const [shakingId, setShakingId] = useState<number | null>(null);
  const { after } = useTimers();

  const startNewRound = useCallback(() => {
    const newTarget = Math.floor(Math.random() * PALETTE.length);
    setTargetIdx(newTarget);
    const field = buildField(
      newTarget,
      MATCH_COUNT_BY_LEVEL[level] ?? 2,
      FIELD_SIZE_BY_LEVEL[level] ?? 6,
      nextId.current,
    );
    nextId.current += field.length;
    setPieces(field);
  }, [level]);

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, piece: Piece) => {
      event.stopPropagation();
      if (piece.colorIdx === targetIdx) {
        celebrate({ clientX: event.clientX, clientY: event.clientY });
        setPieces((prev) => {
          const next = prev.filter((p) => p.id !== piece.id);
          if (next.filter((p) => p.colorIdx === targetIdx).length === 0) {
            after(700, startNewRound);
          }
          return next;
        });
      } else {
        playJugarSound("gentle");
        setShakingId(piece.id);
        after(400, () => setShakingId(null));
      }
    },
    [targetIdx, celebrate, after, startNewRound],
  );

  const target = PALETTE[targetIdx]!;

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
      {/* El color objetivo, grande y respirando arriba — nunca hace falta leer. */}
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "max(env(safe-area-inset-top), 16px)",
          left: "50%",
          marginLeft: -34,
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: target.color,
          boxShadow: `0 8px 20px ${target.color}66, 0 0 0 6px #fff`,
        }}
      />
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        {t("jugar.colores.instruction")}
      </span>

      <AnimatePresence>
        {pieces.map((piece) => {
          const Shape = piece.Shape;
          const color = PALETTE[piece.colorIdx]!.color;
          return (
            <motion.button
              key={piece.id}
              type="button"
              aria-label={t("a11y.target")}
              onPointerDown={(event) => handleTap(event, piece)}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                shakingId === piece.id
                  ? { scale: 1, opacity: 1, rotate: [0, -10, 10, -6, 0], x: [0, -4, 4, -2, 0] }
                  : { scale: 1, opacity: 1 }
              }
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
              transition={
                shakingId === piece.id
                  ? { duration: 0.4, ease: "easeOut" }
                  : { type: "spring", stiffness: 260, damping: 18 }
              }
              style={{
                position: "absolute",
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                width: "4.2rem",
                height: "4.2rem",
                transform: "translate(-50%, -50%)",
                background: "none",
                border: "none",
                padding: 0,
                touchAction: "manipulation",
              }}
            >
              <Shape color={color} />
            </motion.button>
          );
        })}
      </AnimatePresence>
    </GameShell>
  );
}
