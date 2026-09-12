import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { ReplayQuestionButton } from "../../components/ReplayQuestionButton";
import { type BuddyId } from "../../data/buddies";
import { useProgressStore } from "../../store/progressStore";
import { asset } from "../../utils/asset";
import { pickRandom, pickRandomExcept, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";

type EmotionType = "happy" | "sad" | "angry" | "scared";

interface EmotionMeta {
  questionFile: string;
  exclaimFile: string;
}

const EMOTION_META: Record<EmotionType, EmotionMeta> = {
  happy: { questionFile: "n7-question-happy.mp3", exclaimFile: "n7-exclaim-happy.mp3" },
  sad: { questionFile: "n7-question-sad.mp3", exclaimFile: "n7-exclaim-sad.mp3" },
  angry: { questionFile: "n7-question-angry.mp3", exclaimFile: "n7-exclaim-angry.mp3" },
  scared: { questionFile: "n7-question-scared.mp3", exclaimFile: "n7-exclaim-scared.mp3" },
};
const ALL_EMOTIONS: [EmotionType, ...EmotionType[]] = ["happy", "sad", "angry", "scared"];

/** El compañero elegido es quien muestra las 4 emociones, no un personaje
 * genérico aparte: mismo principio que el resto de los niveles (el niño
 * reconoce a SU perrito haciendo cada cara, no a un tercero sin relación). */
function buddyEmotionImage(buddy: BuddyId, emotion: EmotionType): string {
  return asset(`illustrations/emotion-${buddy}-${emotion}.png`);
}

const BACKGROUND = "linear-gradient(160deg, #FFE8F3 0%, #FFC1E0 100%)";
const SHAKE_MS = 400;
const NEXT_QUESTION_DELAY_MS = 1500;

interface N7EmocionesProps {
  locale: string;
  onExit: () => void;
}

/**
 * N7 · Emociones (docs/CURRICULUM.md ficha N7, eje socioemocional ❤️).
 * "¿Quién está feliz?" → tocar al compañero elegido cuando muestra esa
 * emoción (las 4 expresiones son del mismo perrito que el niño ya eligió,
 * no de un personaje genérico aparte). Las 4 expresiones están siempre
 * visibles (igual que N5: comprensión receptiva, no memoria). Tocar la
 * incorrecta solo la sacude, sin sonido negativo; la pregunta sigue en pie
 * hasta acertar.
 */
export function N7Emociones({ locale, onExit }: N7EmocionesProps) {
  const { t } = useTranslation();
  const selectedBuddy = useProgressStore((state) => state.selectedBuddy) ?? "odie";
  const buddyImages = useMemo(
    () =>
      Object.fromEntries(ALL_EMOTIONS.map((e) => [e, buddyEmotionImage(selectedBuddy, e)])) as Record<
        EmotionType,
        string
      >,
    [selectedBuddy],
  );
  const [order, setOrder] = useState<EmotionType[]>(() => shuffle(ALL_EMOTIONS));
  const [target, setTarget] = useState<EmotionType>(() => pickRandom(ALL_EMOTIONS));
  const [busy, setBusy] = useState(false);
  const [shakeType, setShakeType] = useState<EmotionType | null>(null);
  // Timers en vuelo (sacudida y siguiente pregunta): se limpian al desmontar,
  // igual que en N5/N9. Sin esto, salir del nivel dentro de la ventana de
  // NEXT_QUESTION_DELAY_MS dejaba la pregunta hablada ("¿Quién está feliz?")
  // sonando ENCIMA del mapa de mundos, ya fuera del juego.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const { celebrate, encourage, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n7", {
    locale,
    welcomeFile: EMOTION_META[target].questionFile,
  });

  const handleTapEmotion = useCallback(
    (type: EmotionType, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (type !== target) {
        // Se sacude Y se anima a seguir intentando: la consigna sigue en pie.
        encourage();
        setShakeType(type);
        timers.current.push(setTimeout(() => setShakeType(null), SHAKE_MS));
        return;
      }

      setBusy(true);
      celebrate(event);
      playVoiceClip(locale, EMOTION_META[type].exclaimFile);
      timers.current.push(
        setTimeout(() => {
          const next = pickRandomExcept(ALL_EMOTIONS, target);
          setOrder(shuffle(ALL_EMOTIONS));
          setTarget(next);
          playVoiceClip(locale, EMOTION_META[next].questionFile);
          setBusy(false);
        }, NEXT_QUESTION_DELAY_MS),
      );
    },
    [busy, target, locale, celebrate, encourage],
  );

  return (
    <GameShell
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      hideBuddy
      style={{ display: "flex", flexDirection: "column" }}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <ReplayQuestionButton onReplay={() => !busy && playVoiceClip(locale, EMOTION_META[target].questionFile)} />

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
          padding: "var(--space-sm) var(--space-md) var(--space-md)",
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
              src={buddyImages[type]}
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
