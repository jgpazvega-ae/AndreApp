import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom, pickRandomExcept, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";

type EmotionType = "happy" | "sad" | "angry" | "scared";

const EMOTION_ASSET: Record<EmotionType, { image: string; questionFile: string; exclaimFile: string }> = {
  happy: {
    image: asset("illustrations/emotion-happy.png"),
    questionFile: "n7-question-happy.mp3",
    exclaimFile: "n7-exclaim-happy.mp3",
  },
  sad: {
    image: asset("illustrations/emotion-sad.png"),
    questionFile: "n7-question-sad.mp3",
    exclaimFile: "n7-exclaim-sad.mp3",
  },
  angry: {
    image: asset("illustrations/emotion-angry.png"),
    questionFile: "n7-question-angry.mp3",
    exclaimFile: "n7-exclaim-angry.mp3",
  },
  scared: {
    image: asset("illustrations/emotion-scared.png"),
    questionFile: "n7-question-scared.mp3",
    exclaimFile: "n7-exclaim-scared.mp3",
  },
};
const ALL_EMOTIONS: [EmotionType, ...EmotionType[]] = ["happy", "sad", "angry", "scared"];

const BACKGROUND = "linear-gradient(160deg, #FFE8F3 0%, #FFC1E0 100%)";
const SHAKE_MS = 400;
const NEXT_QUESTION_DELAY_MS = 1500;

interface N7EmocionesProps {
  locale: string;
  onExit: () => void;
}

/**
 * N7 · Emociones (docs/CURRICULUM.md ficha N7, eje socioemocional ❤️).
 * "¿Quién está feliz?" → tocar a la mascota que muestra esa emoción. Las 4
 * expresiones están siempre visibles (igual que N5: comprensión receptiva,
 * no memoria). Tocar la incorrecta solo la sacude, sin sonido negativo; la
 * pregunta sigue en pie hasta acertar.
 */
export function N7Emociones({ locale, onExit }: N7EmocionesProps) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<EmotionType[]>(() => shuffle(ALL_EMOTIONS));
  const [target, setTarget] = useState<EmotionType>(() => pickRandom(ALL_EMOTIONS));
  const [busy, setBusy] = useState(false);
  const [shakeType, setShakeType] = useState<EmotionType | null>(null);
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n7", {
    locale,
    welcomeFile: EMOTION_ASSET[target].questionFile,
  });

  const handleTapEmotion = useCallback(
    (type: EmotionType, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (type !== target) {
        setShakeType(type);
        setTimeout(() => setShakeType(null), SHAKE_MS);
        return;
      }

      setBusy(true);
      celebrate(event);
      playVoiceClip(locale, EMOTION_ASSET[type].exclaimFile);
      setTimeout(() => {
        const next = pickRandomExcept(ALL_EMOTIONS, target);
        setOrder(shuffle(ALL_EMOTIONS));
        setTarget(next);
        playVoiceClip(locale, EMOTION_ASSET[next].questionFile);
        setBusy(false);
      }, NEXT_QUESTION_DELAY_MS);
    },
    [busy, target, locale, celebrate],
  );

  return (
    <GameShell
      levelId="n7"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          alignItems: "center",
          justifyItems: "center",
          gap: "var(--space-sm)",
          padding: "calc(max(env(safe-area-inset-top), 16px) + 64px) var(--space-md) var(--space-md)",
        }}
      >
        {order.map((type) => (
          <motion.button
            key={type}
            type="button"
            aria-label={t("a11y.emotion")}
            onPointerDown={(e) => handleTapEmotion(type, e)}
            animate={shakeType === type ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: SHAKE_MS / 1000 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              width: "38vw",
              maxWidth: 180,
              aspectRatio: "1",
            }}
          >
            <img
              src={EMOTION_ASSET[type].image}
              alt=""
              aria-hidden="true"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 14px rgba(120,20,80,0.2))",
              }}
            />
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
