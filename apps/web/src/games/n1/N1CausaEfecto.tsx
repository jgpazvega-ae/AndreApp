import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
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

const CONFETTI_COLORS = ["#FFB03B", "#4F46E5", "#F58BC0", "#6BD6C2", "#FFFFFF"];

const IDLE_HINT_DELAY_MS = 5000;
const POP_LIFETIME_MS = 1200;
const CONFETTI_LIFETIME_MS = 700;

interface Pop {
  id: number;
  x: number;
  y: number;
  image: string;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
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
  const [confetti, setConfetti] = useState<Confetti[]>([]);
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

      setPops((prev) => [...prev, { id, x, y, image: object.image }]);
      playChime();
      playVoiceClip(locale, object.voiceFile);

      const burst: Confetti[] = Array.from({ length: 8 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
        const distance = 50 + Math.random() * 40;
        return {
          id: nextId.current++,
          x,
          y,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
        };
      });
      setConfetti((prev) => [...prev, ...burst]);

      setTimeout(() => {
        setPops((prev) => prev.filter((pop) => pop.id !== id));
      }, POP_LIFETIME_MS);
      setTimeout(() => {
        const burstIds = new Set(burst.map((c) => c.id));
        setConfetti((prev) => prev.filter((c) => !burstIds.has(c.id)));
      }, CONFETTI_LIFETIME_MS);
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
        background: "radial-gradient(circle at 20% 15%, #FFD68A 0%, #FFB03B 45%, #F58C1F 100%)",
        touchAction: "manipulation",
      }}
    >
      {/* Manchas decorativas suaves, sin distraer del objetivo táctil */}
      <div aria-hidden="true" style={DECOR_BLOB_1} />
      <div aria-hidden="true" style={DECOR_BLOB_2} />

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
        {confetti.map((c) => (
          <motion.span
            key={c.id}
            aria-hidden="true"
            initial={{ opacity: 1, x: c.x - 5, y: c.y - 5, scale: 1 }}
            animate={{ opacity: 0, x: c.x + c.dx, y: c.y + c.dy, scale: 0.3 }}
            transition={{ duration: CONFETTI_LIFETIME_MS / 1000, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c.color,
              pointerEvents: "none",
            }}
          />
        ))}
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
    </div>
  );
}

const DECOR_BLOB_1: React.CSSProperties = {
  position: "absolute",
  top: "-10%",
  right: "-15%",
  width: "50vw",
  height: "50vw",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.18)",
  pointerEvents: "none",
};

const DECOR_BLOB_2: React.CSSProperties = {
  position: "absolute",
  bottom: "-15%",
  left: "-10%",
  width: "40vw",
  height: "40vw",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.12)",
  pointerEvents: "none",
};
