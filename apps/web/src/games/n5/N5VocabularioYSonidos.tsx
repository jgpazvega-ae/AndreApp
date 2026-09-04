import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom, pickRandomExcept, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";

type AnimalType = "dog" | "cat" | "duck";

const ANIMAL_ASSET: Record<AnimalType, { image: string; questionFile: string; exclaimFile: string }> = {
  dog: {
    image: asset("illustrations/animal-dog.png"),
    questionFile: "n5-question-dog.mp3",
    exclaimFile: "n5-exclaim-dog.mp3",
  },
  cat: {
    image: asset("illustrations/animal-cat.png"),
    questionFile: "n5-question-cat.mp3",
    exclaimFile: "n5-exclaim-cat.mp3",
  },
  duck: {
    image: asset("illustrations/animal-duck.png"),
    questionFile: "n5-question-duck.mp3",
    exclaimFile: "n5-exclaim-duck.mp3",
  },
};
const ALL_ANIMALS: [AnimalType, ...AnimalType[]] = ["dog", "cat", "duck"];

const BACKGROUND = "linear-gradient(160deg, #E8F7FF 0%, #A8E6CF 100%)";
const SHAKE_MS = 400;
const NEXT_QUESTION_DELAY_MS = 1500;

interface N5VocabularioYSonidosProps {
  locale: string;
  onExit: () => void;
}

/**
 * N5 · Vocabulario y sonidos (docs/CURRICULUM.md ficha N5).
 * "¿Dónde está el perro?" → tocar el correcto; escucha nombre + sonido.
 * Los 3 animales están siempre visibles (comprensión auditiva receptiva,
 * no memoria). Tocar el incorrecto solo lo sacude, sin sonido negativo;
 * la pregunta sigue en pie hasta acertar.
 */
export function N5VocabularioYSonidos({ locale, onExit }: N5VocabularioYSonidosProps) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<AnimalType[]>(() => shuffle(ALL_ANIMALS));
  const [target, setTarget] = useState<AnimalType>(() => pickRandom(ALL_ANIMALS));
  const [busy, setBusy] = useState(false);
  const [shakeType, setShakeType] = useState<AnimalType | null>(null);
  // La consigna de bienvenida ES la primera pregunta, por eso sale del target inicial.
  const { celebrate, celebrateSignal, confettiField } = useGameSession("n5", {
    locale,
    welcomeFile: ANIMAL_ASSET[target].questionFile,
  });

  const handleTapAnimal = useCallback(
    (type: AnimalType, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (type !== target) {
        // Solo se sacude: la consigna sigue en pie hasta acertar.
        setShakeType(type);
        setTimeout(() => setShakeType(null), SHAKE_MS);
        return;
      }

      setBusy(true);
      celebrate(event);
      playVoiceClip(locale, ANIMAL_ASSET[type].exclaimFile);
      setTimeout(() => {
        const next = pickRandomExcept(ALL_ANIMALS, target);
        setOrder(shuffle(ALL_ANIMALS));
        setTarget(next);
        playVoiceClip(locale, ANIMAL_ASSET[next].questionFile);
        setBusy(false);
      }, NEXT_QUESTION_DELAY_MS);
    },
    [busy, target, locale, celebrate],
  );

  return (
    <GameShell
      levelId="n5"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          padding: "0 var(--space-md)",
        }}
      >
        {order.map((type) => (
          <motion.button
            key={type}
            type="button"
            aria-label={t("a11y.animal")}
            onPointerDown={(e) => handleTapAnimal(type, e)}
            animate={shakeType === type ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: SHAKE_MS / 1000 }}
            whileTap={{ scale: 0.88 }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              width: "28vw",
              maxWidth: 130,
              aspectRatio: "1",
            }}
          >
            <img
              src={ANIMAL_ASSET[type].image}
              alt=""
              aria-hidden="true"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 14px rgba(0,60,50,0.2))",
              }}
            />
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
