import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playJugarSound } from "../../../audio/audioEngine";
import { GameShell } from "../../../components/GameShell";
import { useGameSession } from "../../useGameSession";
import { useTimers } from "../../useTimers";
import { StarArt } from "../jugarArt";

const BACKGROUND = "radial-gradient(circle at 30% 20%, #2A2A5C 0%, #14142E 60%, #0A0A1C 100%)";
const BOUNDS = { xMin: 14, xMax: 86, yMin: 16, yMax: 78 };
const STAR_COLORS = ["#FFD93D", "#FFB03B", "#FF9466", "#8CE6C6"];
/** Cuánto espera una estrella antes de irse a otro lugar sin castigo (Product Vision: "aparece, espera"). */
const WAIT_MS_BY_LEVEL: Record<1 | 2 | 3, number> = { 1: 3200, 2: 2400, 3: 1900 };
/** A partir de este nivel de reto aparece una segunda estrella a la vez. */
const TWO_STARS_LEVEL = 3;

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

function randomStar(id: number): Star {
  return {
    id,
    x: BOUNDS.xMin + Math.random() * (BOUNDS.xMax - BOUNDS.xMin),
    y: BOUNDS.yMin + Math.random() * (BOUNDS.yMax - BOUNDS.yMin),
    size: 4.5 + Math.random() * 3,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
  };
}

interface AtrapaLaEstrellaProps {
  locale: string;
  onExit: () => void;
}

/**
 * Atrapa la Estrella (Jugar §Game 02): una estrella aparece, espera, y si
 * nadie la toca se va sola a otro lugar — sin sonido ni castigo, solo
 * invita de nuevo. Distinta de N2 (el compañero se persigue en movimiento
 * continuo): aquí el reto es reaccionar a tiempo, no seguir un blanco móvil.
 */
export function AtrapaLaEstrella({ locale, onExit }: AtrapaLaEstrellaProps) {
  const { t } = useTranslation();
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound, difficultyLevel } = useGameSession(
    "estrellas",
    { locale },
  );
  const nextId = useRef(0);
  const level = (difficultyLevel as 1 | 2 | 3) ?? 1;
  const wantedCount = level >= TWO_STARS_LEVEL ? 2 : 1;
  const [stars, setStars] = useState<Star[]>(() =>
    Array.from({ length: wantedCount }, () => randomStar(nextId.current++)),
  );
  const { after, cancel } = useTimers();
  const wanderTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const armWander = useCallback(
    (starId: number) => {
      const timer = after(WAIT_MS_BY_LEVEL[level], () => {
        // Se borra su propia entrada ANTES de mover la estrella: si no, el
        // efecto de abajo cree que todavía tiene temporizador y nunca la
        // vuelve a armar — la estrella se movería una sola vez y después
        // se quedaría quieta para siempre.
        wanderTimers.current.delete(starId);
        setStars((prev) => prev.map((s) => (s.id === starId ? randomStar(s.id) : s)));
      });
      wanderTimers.current.set(starId, timer);
    },
    [after, level],
  );

  useEffect(() => {
    stars.forEach((s) => {
      if (!wanderTimers.current.has(s.id)) armWander(s.id);
    });
    // Solo arma temporizadores para estrellas nuevas — no reprograma las que ya tenían uno.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars]);

  // Si una estrella "vaga" a nueva posición, su temporizador de espera se re-arma.
  useEffect(() => {
    const ids = new Set(stars.map((s) => s.id));
    wanderTimers.current.forEach((timer, id) => {
      if (!ids.has(id)) {
        cancel(timer);
        wanderTimers.current.delete(id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars]);

  const handleCatch = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, star: Star) => {
      event.stopPropagation();
      const timer = wanderTimers.current.get(star.id);
      if (timer) {
        cancel(timer);
        wanderTimers.current.delete(star.id);
      }
      playJugarSound("pop");
      celebrate({ clientX: event.clientX, clientY: event.clientY });
      setStars((prev) => prev.filter((s) => s.id !== star.id));
      after(240, () => {
        const fresh = randomStar(nextId.current++);
        setStars((prev) => (prev.length >= wantedCount ? prev : [...prev, fresh]));
        armWander(fresh.id);
      });
    },
    [celebrate, after, cancel, wantedCount, armWander],
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
        {stars.map((star) => (
          <motion.button
            key={star.id}
            type="button"
            aria-label={t("a11y.target")}
            onPointerDown={(event) => handleCatch(event, star)}
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{ scale: [1, 1.12, 1], opacity: 1, rotate: [0, -8, 8, 0] }}
            exit={{ scale: 0.2, opacity: 0, transition: { duration: 0.2 } }}
            transition={{
              scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.3 },
            }}
            whileTap={{ scale: 1.3, rotate: 0 }}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}rem`,
              height: `${star.size}rem`,
              transform: "translate(-50%, -50%)",
              background: "none",
              border: "none",
              padding: 0,
              touchAction: "manipulation",
              filter: `drop-shadow(0 0 18px ${star.color}88)`,
            }}
          >
            <StarArt color={star.color} />
          </motion.button>
        ))}
      </AnimatePresence>
    </GameShell>
  );
}
