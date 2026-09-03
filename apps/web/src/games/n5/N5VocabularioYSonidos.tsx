import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
import { DecorBlobs } from "../../components/DecorBlobs";
import { GameBuddy } from "../../components/GameBuddy";
import { useConfetti } from "../../effects/useConfetti";
import { useProgressStore } from "../../store/progressStore";
import { asset } from "../../utils/asset";

type AnimalType = "dog" | "cat" | "duck";

const ANIMAL_ASSET: Record<AnimalType, { image: string; questionFile: string; exclaimFile: string }> = {
  dog: { image: asset("illustrations/animal-dog.png"), questionFile: "n5-question-dog.mp3", exclaimFile: "n5-exclaim-dog.mp3" },
  cat: { image: asset("illustrations/animal-cat.png"), questionFile: "n5-question-cat.mp3", exclaimFile: "n5-exclaim-cat.mp3" },
  duck: { image: asset("illustrations/animal-duck.png"), questionFile: "n5-question-duck.mp3", exclaimFile: "n5-exclaim-duck.mp3" },
};
const ALL_ANIMALS: AnimalType[] = ["dog", "cat", "duck"];

const SHAKE_MS = 400;
const NEXT_QUESTION_DELAY_MS = 1500;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickNextTarget(current: AnimalType | null): AnimalType {
  const options = ALL_ANIMALS.filter((a) => a !== current);
  return options[Math.floor(Math.random() * options.length)]!;
}

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
  const [order, setOrder] = useState<AnimalType[]>(() => shuffle(ALL_ANIMALS));
  const [target, setTarget] = useState<AnimalType>(() => order[0]!);
  const [busy, setBusy] = useState(false);
  const [shakeType, setShakeType] = useState<AnimalType | null>(null);
  const [celebrations, setCelebrations] = useState(0);
  const recordPlay = useProgressStore((state) => state.recordPlay);
  const { burst, confettiField } = useConfetti();
  const mounted = useRef(false);

  useEffect(() => {
    recordPlay("n5");
    const t = setTimeout(() => playVoiceClip(locale, ANIMAL_ASSET[target].questionFile), 500);
    mounted.current = true;
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTapAnimal = useCallback(
    (type: AnimalType, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (type === target) {
        setBusy(true);
        playChime();
        playVoiceClip(locale, ANIMAL_ASSET[type].exclaimFile);
        burst(event.clientX, event.clientY);
        setCelebrations((c) => c + 1);
        setTimeout(() => {
          const next = pickNextTarget(target);
          setOrder(shuffle(ALL_ANIMALS));
          setTarget(next);
          playVoiceClip(locale, ANIMAL_ASSET[next].questionFile);
          setBusy(false);
        }, NEXT_QUESTION_DELAY_MS);
      } else {
        setShakeType(type);
        setTimeout(() => setShakeType(null), SHAKE_MS);
      }
    },
    [busy, target, locale, burst],
  );

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: "100vh",
        overflow: "hidden",
        background: "linear-gradient(160deg, #E8F7FF 0%, #A8E6CF 100%)",
        touchAction: "manipulation",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DecorBlobs />

      <button
        type="button"
        aria-label="Regresar"
        onClick={onExit}
        style={{
          position: "absolute",
          top: "max(env(safe-area-inset-top), 16px)",
          left: 16,
          zIndex: 10,
          width: 48,
          height: 48,
          borderRadius: "var(--radius-pill)",
          background: "rgba(255,255,255,0.85)",
          fontSize: "1.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⬅️
      </button>

      <GameBuddy levelId="n5" celebrateSignal={celebrations} />

      {confettiField}

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
            aria-label="Animal"
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
              style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 14px rgba(0,60,50,0.2))" }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
