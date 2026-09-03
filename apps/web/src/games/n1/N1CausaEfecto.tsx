import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
import { useProgressStore } from "../../store/progressStore";

interface DelightObject {
  icon: string;
  voiceFile: string;
}

const OBJECTS: DelightObject[] = [
  { icon: "⭐", voiceFile: "object-star.mp3" },
  { icon: "🔔", voiceFile: "object-bell.mp3" },
  { icon: "🎈", voiceFile: "object-balloon.mp3" },
  { icon: "🌸", voiceFile: "object-flower.mp3" },
];

const IDLE_HINT_DELAY_MS = 5000;
const POP_LIFETIME_MS = 1200;

interface Pop {
  id: number;
  x: number;
  y: number;
  icon: string;
}

interface N1CausaEfectoProps {
  locale: string;
  onExit: () => void;
}

/**
 * N1 · Causa y efecto (docs/CURRICULUM.md ficha N1).
 * Tocar cualquier parte de la pantalla produce una animación + sonido +
 * la voz nombra lo que apareció. Sin estado de fallo: cualquier toque es
 * "correcto". Si no toca en ~5s, un brillo suave invita a intentar.
 */
export function N1CausaEfecto({ locale, onExit }: N1CausaEfectoProps) {
  const [pops, setPops] = useState<Pop[]>([]);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const nextId = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordPlay = useProgressStore((state) => state.recordPlay);

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

      setPops((prev) => [...prev, { id, x, y, icon: object.icon }]);
      playChime();
      playVoiceClip(locale, object.voiceFile);

      setTimeout(() => {
        setPops((prev) => prev.filter((pop) => pop.id !== id));
      }, POP_LIFETIME_MS);
    },
    [locale, resetIdleTimer],
  );

  return (
    <div
      onPointerDown={handleTap}
      style={{
        position: "relative",
        flex: 1,
        minHeight: "100vh",
        overflow: "hidden",
        background: "linear-gradient(160deg, #FFE3B3 0%, #FFB03B 100%)",
        touchAction: "manipulation",
      }}
    >
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

      <AnimatePresence>
        {showIdleHint && pops.length === 0 && (
          <motion.div
            key="idle-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <motion.span
              aria-hidden="true"
              style={{ fontSize: "5rem", filter: "drop-shadow(0 0 24px rgba(255,255,255,0.9))" }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              👋
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pops.map((pop) => (
          <motion.span
            key={pop.id}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.2, x: pop.x - 40, y: pop.y - 40 }}
            animate={{ opacity: 1, scale: 1.3, y: pop.y - 90 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontSize: "4rem",
              pointerEvents: "none",
            }}
          >
            {pop.icon}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
