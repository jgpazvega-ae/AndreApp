import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
import { DecorBlobs } from "../../components/DecorBlobs";
import { GameBuddy } from "../../components/GameBuddy";
import { useConfetti } from "../../effects/useConfetti";
import { useProgressStore } from "../../store/progressStore";
import { asset } from "../../utils/asset";

interface DelightObject {
  image: string;
  voiceFile: string;
}

const OBJECTS: DelightObject[] = [
  { image: asset("illustrations/object-star.png"), voiceFile: "object-star.mp3" },
  { image: asset("illustrations/object-bell.png"), voiceFile: "object-bell.mp3" },
  { image: asset("illustrations/object-balloon.png"), voiceFile: "object-balloon.mp3" },
  { image: asset("illustrations/object-flower.png"), voiceFile: "object-flower.mp3" },
];

const IDLE_HINT_DELAY_MS = 5000;
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
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [celebrations, setCelebrations] = useState(0);
  const nextId = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordPlay = useProgressStore((state) => state.recordPlay);
  const { burst, confettiField } = useConfetti();

  const resetIdleTimer = useCallback(() => {
    setShowIdleHint(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setShowIdleHint(true), IDLE_HINT_DELAY_MS);
  }, []);

  useEffect(() => {
    recordPlay("n1");
    const welcomeTimer = setTimeout(() => playVoiceClip(locale, "welcome.mp3"), 500);
    resetIdleTimer();
    return () => {
      clearTimeout(welcomeTimer);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      resetIdleTimer();
      const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!;
      const id = nextId.current++;
      const x = event.clientX;
      const y = event.clientY;

      setPops((prev) => [...prev, { id, x, y, image: object.image }]);
      playChime();
      playVoiceClip(locale, object.voiceFile);
      burst(x, y);
      setCelebrations((c) => c + 1);

      setTimeout(() => {
        setPops((prev) => prev.filter((pop) => pop.id !== id));
      }, POP_LIFETIME_MS);
    },
    [locale, resetIdleTimer, burst],
  );

  return (
    <div
      onPointerDown={handleTap}
      style={{
        position: "relative",
        flex: 1,
        minHeight: "100vh",
        overflow: "hidden",
        background: "radial-gradient(circle at 20% 15%, #FFD68A 0%, #FFB03B 45%, #F58C1F 100%)",
        touchAction: "manipulation",
      }}
    >
      <DecorBlobs />

      <button
        type="button"
        aria-label="Regresar"
        onClick={(e) => {
          e.stopPropagation();
          onExit();
        }}
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

      <GameBuddy levelId="n1" celebrateSignal={celebrations} />

      <AnimatePresence>
        {showIdleHint && pops.length === 0 && (
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

      {confettiField}

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
    </div>
  );
}
