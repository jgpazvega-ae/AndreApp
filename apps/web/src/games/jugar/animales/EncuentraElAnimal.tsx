import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playJugarSound } from "../../../audio/audioEngine";
import { GameShell } from "../../../components/GameShell";
import { shuffle } from "../../../utils/random";
import { useGameSession } from "../../useGameSession";
import { useTimers } from "../../useTimers";
import { CatArt, CowArt, DogArt, DuckArt, RabbitArt } from "../jugarArt";

const BACKGROUND = "linear-gradient(160deg, #E0F7EC 0%, #C8F0D8 100%)";
const ANIMALS = [
  { id: "dog", Art: DogArt },
  { id: "cat", Art: CatArt },
  { id: "cow", Art: CowArt },
  { id: "duck", Art: DuckArt },
  { id: "rabbit", Art: RabbitArt },
] as const;
const BOUNDS = { xMin: 16, xMax: 84, yMin: 42, yMax: 82 };
const FIELD_SIZE_BY_LEVEL: Record<1 | 2 | 3, number> = { 1: 3, 2: 4, 3: 5 };

/**
 * pickRandom<T> no infiere bien sobre ANIMALS: cada posición del tuple
 * `as const` tiene un literal de `id` distinto, así que T solo se resuelve
 * desde la primera posición. Random directo evita el problema.
 */
function randomAnimalId(): string {
  return ANIMALS[Math.floor(Math.random() * ANIMALS.length)]!.id;
}

interface FieldAnimal {
  id: number;
  animalId: string;
  x: number;
  y: number;
}

function buildField(targetAnimalId: string, size: number, startId: number): FieldAnimal[] {
  const others = ANIMALS.filter((a) => a.id !== targetAnimalId);
  const chosen = [targetAnimalId, ...shuffle(others.map((a) => a.id)).slice(0, size - 1)];
  const shuffled = shuffle(chosen);
  const cols = size <= 3 ? 3 : Math.ceil(size / 2);
  return shuffled.map((animalId, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = (BOUNDS.xMax - BOUNDS.xMin) / cols;
    const cellH = (BOUNDS.yMax - BOUNDS.yMin) / Math.ceil(size / cols);
    return {
      id: startId + i,
      animalId,
      x: BOUNDS.xMin + cellW * col + cellW * 0.5,
      y: BOUNDS.yMin + cellH * row + cellH * 0.5,
    };
  });
}

interface EncuentraElAnimalProps {
  locale: string;
  onExit: () => void;
}

/**
 * Encuentra el Animal (Jugar §Game 04): un animal objetivo se muestra
 * arriba (icono grande, sin voz), el niño lo busca entre varios abajo.
 * Discriminación visual pura — distinta de N5 (comprensión auditiva: "¿dónde
 * está el perro?" hablado), aunque comparta el gesto de tocar entre varios.
 */
export function EncuentraElAnimal({ locale, onExit }: EncuentraElAnimalProps) {
  const { t } = useTranslation();
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound, difficultyLevel } = useGameSession(
    "animales",
    { locale, welcomeFile: "jugar-animales-welcome.mp3" },
  );
  const level = (difficultyLevel as 1 | 2 | 3) ?? 1;
  const nextId = useRef(0);
  const [targetAnimalId, setTargetAnimalId] = useState(() => randomAnimalId());
  const [field, setField] = useState<FieldAnimal[]>(() =>
    buildField(targetAnimalId, FIELD_SIZE_BY_LEVEL[level] ?? 3, nextId.current),
  );
  const [shakingId, setShakingId] = useState<number | null>(null);
  const { after } = useTimers();

  const nextRound = useCallback(() => {
    const target = randomAnimalId();
    setTargetAnimalId(target);
    const size = FIELD_SIZE_BY_LEVEL[level] ?? 3;
    const newField = buildField(target, size, nextId.current);
    nextId.current += newField.length;
    setField(newField);
  }, [level]);

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, item: FieldAnimal) => {
      event.stopPropagation();
      if (item.animalId === targetAnimalId) {
        playJugarSound("pop");
        celebrate({ clientX: event.clientX, clientY: event.clientY });
        after(500, nextRound);
      } else {
        playJugarSound("gentle");
        setShakingId(item.id);
        after(400, () => setShakingId(null));
      }
    },
    [targetAnimalId, celebrate, after, nextRound],
  );

  const TargetArt = ANIMALS.find((a) => a.id === targetAnimalId)!.Art;

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
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "max(env(safe-area-inset-top), 20px)",
          left: "50%",
          marginLeft: -44,
          width: 88,
          height: 88,
          filter: "drop-shadow(0 10px 14px rgba(58,46,34,0.2))",
        }}
      >
        <TargetArt />
      </motion.div>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        {t("jugar.animales.instruction")}
      </span>

      <AnimatePresence>
        {field.map((item) => {
          const Art = ANIMALS.find((a) => a.id === item.animalId)!.Art;
          return (
            <motion.button
              key={item.id}
              type="button"
              aria-label={t("a11y.animal")}
              onPointerDown={(event) => handleTap(event, item)}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                shakingId === item.id ? { scale: 1, opacity: 1, rotate: [0, -10, 10, -6, 0] } : { scale: 1, opacity: 1 }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={
                shakingId === item.id
                  ? { duration: 0.4, ease: "easeOut" }
                  : { type: "spring", stiffness: 240, damping: 18 }
              }
              whileTap={{ scale: 1.1 }}
              style={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: "5.4rem",
                height: "5.4rem",
                transform: "translate(-50%, -50%)",
                background: "none",
                border: "none",
                padding: 0,
                touchAction: "manipulation",
                filter: "drop-shadow(0 8px 10px rgba(58,46,34,0.18))",
              }}
            >
              <Art />
            </motion.button>
          );
        })}
      </AnimatePresence>
    </GameShell>
  );
}
