import { motion, type PanInfo } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playJugarSound } from "../../../audio/audioEngine";
import { GameShell } from "../../../components/GameShell";
import { pickRandom } from "../../../utils/random";
import { useGameSession } from "../../useGameSession";
import { useTimers } from "../../useTimers";
import { AppleArt, CarrotArt, CatArt, CowArt, DogArt, DuckArt, IceCreamArt, PizzaArt, RabbitArt } from "../jugarArt";

const BACKGROUND = "linear-gradient(160deg, #FFF6E0 0%, #FFE4C4 100%)";

const ANIMALS = [
  { id: "rabbit", Art: RabbitArt, food: "carrot" as const },
  { id: "duck", Art: DuckArt, food: "carrot" as const },
  { id: "cow", Art: CowArt, food: "apple" as const },
  { id: "dog", Art: DogArt, food: "pizza" as const },
  { id: "cat", Art: CatArt, food: "icecream" as const },
] as const;
const FOODS = {
  carrot: CarrotArt,
  apple: AppleArt,
  pizza: PizzaArt,
  icecream: IceCreamArt,
};
type FoodId = keyof typeof FOODS;
const FOOD_IDS = Object.keys(FOODS) as FoodId[];

/** Margen generoso alrededor del animal: soltar cerca cuenta como soltar encima (dedos, no cursores de precisión). */
const DROP_MARGIN_PX = 48;

interface AlimentaAlAnimalProps {
  locale: string;
  onExit: () => void;
}

/**
 * Alimenta al Animal (Jugar §Game 05): arrastrar la comida correcta hasta
 * el animal. Primera mecánica DRAG-AND-DROP real de la biblioteca de Jugar
 * (las anteriores son todas TAP) — el dedo debe soltar sobre una zona, no
 * solo tocar. La comida equivocada nunca "falla": vuelve sola a su lugar.
 */
export function AlimentaAlAnimal({ locale, onExit }: AlimentaAlAnimalProps) {
  const { t } = useTranslation();
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("alimenta", {
    locale,
  });
  const [round, setRound] = useState(() => buildRound());
  const [chomping, setChomping] = useState(false);
  const [shaking, setShaking] = useState(false);
  const animalRef = useRef<HTMLDivElement>(null);
  const { after } = useTimers();

  const nextRound = useCallback(() => setRound(buildRound()), []);

  const handleDragEnd = useCallback(
    (info: PanInfo, foodId: FoodId) => {
      const zone = animalRef.current?.getBoundingClientRect();
      if (!zone) return;
      const hit =
        info.point.x >= zone.left - DROP_MARGIN_PX &&
        info.point.x <= zone.right + DROP_MARGIN_PX &&
        info.point.y >= zone.top - DROP_MARGIN_PX &&
        info.point.y <= zone.bottom + DROP_MARGIN_PX;
      if (!hit) return;

      if (foodId === round.animal.food) {
        playJugarSound("chomp");
        setChomping(true);
        celebrate({ clientX: zone.left + zone.width / 2, clientY: zone.top + zone.height / 2 });
        after(280, () => setChomping(false));
        after(650, nextRound);
      } else {
        playJugarSound("gentle");
        setShaking(true);
        after(400, () => setShaking(false));
      }
    },
    [round, celebrate, after, nextRound],
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
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
        {t("jugar.alimenta.instruction")}
      </span>

      <motion.div
        ref={animalRef}
        aria-hidden="true"
        animate={
          chomping
            ? { scale: [1, 1.25, 0.92, 1.08, 1], rotate: [0, -4, 4, 0] }
            : shaking
              ? { rotate: [0, -6, 6, -4, 0] }
              : { y: [0, -8, 0] }
        }
        transition={
          chomping
            ? { duration: 0.65, ease: "easeOut" }
            : shaking
              ? { duration: 0.4, ease: "easeOut" }
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          position: "absolute",
          left: "50%",
          top: "64%",
          width: "9rem",
          height: "9rem",
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 14px 16px rgba(58,46,34,0.22))",
          pointerEvents: "none",
        }}
      >
        <round.animal.Art />
      </motion.div>

      {round.foods.map((foodId, i) => {
        const Art = FOODS[foodId];
        const slotX = round.foods.length === 1 ? 50 : 32 + i * 36;
        return (
          <motion.div
            key={`${round.key}-${foodId}`}
            role="img"
            aria-label={t("a11y.foodItem")}
            drag
            dragSnapToOrigin
            dragElastic={0.4}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            whileDrag={{ scale: 1.15, zIndex: 5 }}
            onDragStart={() => playJugarSound("whoosh")}
            onDragEnd={(_event, info) => handleDragEnd(info, foodId)}
            style={{
              position: "absolute",
              left: `${slotX}%`,
              top: "20%",
              width: "5rem",
              height: "5rem",
              transform: "translate(-50%, -50%)",
              touchAction: "none",
              cursor: "grab",
              filter: "drop-shadow(0 10px 12px rgba(58,46,34,0.2))",
            }}
          >
            <Art />
          </motion.div>
        );
      })}
    </GameShell>
  );
}

function buildRound() {
  // pickRandom<T> no infiere bien sobre ANIMALS: cada posición del tuple
  // `as const` tiene un literal de `id`/`food` distinto, así que T solo se
  // resuelve desde la primera posición (mismo caso que EncuentraElAnimal).
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]!;
  const distractorPool = FOOD_IDS.filter((f) => f !== animal.food);
  const distractor = pickRandom(distractorPool as [FoodId, ...FoodId[]]);
  const foods = Math.random() < 0.5 ? [animal.food, distractor] : [distractor, animal.food];
  return { key: `${animal.id}-${Date.now()}`, animal, foods };
}
