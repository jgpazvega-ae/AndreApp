import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { useIdleHint } from "../useIdleHint";

interface DelightObject {
  image: string;
  voiceFile: string;
}

const OBJECTS: [DelightObject, ...DelightObject[]] = [
  { image: asset("illustrations/object-star.png"), voiceFile: "object-star.mp3" },
  { image: asset("illustrations/object-bell.png"), voiceFile: "object-bell.mp3" },
  { image: asset("illustrations/object-balloon.png"), voiceFile: "object-balloon.mp3" },
  { image: asset("illustrations/object-flower.png"), voiceFile: "object-flower.mp3" },
];

const BACKGROUND = "radial-gradient(circle at 20% 15%, #FFD68A 0%, #FFB03B 45%, #F58C1F 100%)";
const POP_LIFETIME_MS = 1200;

interface Pop {
  id: number;
  x: number;
  y: number;
  image: string;
}

interface N1CausaEfectoProps {
  locale: string;
  onExit: () => void;
}

/**
 * N1 · Causa y efecto (docs/CURRICULUM.md ficha N1).
 * Tocar cualquier parte de la pantalla produce una animación + sonido +
 * la voz nombra lo que apareció. Sin estado de fallo: cualquier toque es
 * "correcto". Si no toca en ~5s, la mascota se asoma invitando a intentar.
 */
export function N1CausaEfecto({ locale, onExit }: N1CausaEfectoProps) {
  const [pops, setPops] = useState<Pop[]>([]);
  const nextId = useRef(0);
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n1", {
    locale,
    welcomeFile: "welcome.mp3",
  });
  const { idle, resetIdle } = useIdleHint();

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      resetIdle();
      const object = pickRandom(OBJECTS);
      const id = nextId.current++;
      const { clientX: x, clientY: y } = event;

      setPops((prev) => [...prev, { id, x, y, image: object.image }]);
      celebrate(event);
      // La voz nombra lo que apareció: el vínculo palabra/objeto es el aporte de N1.
      playVoiceClip(locale, object.voiceFile);

      setTimeout(() => {
        setPops((prev) => prev.filter((pop) => pop.id !== id));
      }, POP_LIFETIME_MS);
    },
    [locale, resetIdle, celebrate],
  );

  return (
    <GameShell
      levelId="n1"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      onPointerDown={handleTap}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <AnimatePresence>
        {idle && pops.length === 0 && (
          <motion.img
            key="idle-hint"
            src={asset("illustrations/mascot.png")}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: [80, 40, 80] }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }}
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              marginLeft: "-90px",
              width: 180,
              pointerEvents: "none",
              filter: "drop-shadow(0 12px 16px rgba(120,60,10,0.25))",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pops.map((pop) => (
          <motion.img
            key={pop.id}
            src={pop.image}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.2, rotate: -8, x: pop.x - 60, y: pop.y - 60 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, -6, 6, 0], y: pop.y - 110 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 120,
              height: 120,
              objectFit: "contain",
              pointerEvents: "none",
              filter: "drop-shadow(0 10px 14px rgba(120,60,10,0.3))",
            }}
          />
        ))}
      </AnimatePresence>
    </GameShell>
  );
}
