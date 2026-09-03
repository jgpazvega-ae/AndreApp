import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { unlockAudio } from "../audio/audioEngine";
import { useAudioUnlock } from "../audio/useAudioUnlock";

interface AudioUnlockGateProps {
  children: ReactNode;
}

/**
 * Pantalla inicial "toca para empezar": necesaria porque iOS Safari exige
 * un gesto directo del usuario antes de permitir cualquier audio
 * (PLAN.md §2). También sirve como bienvenida amigable con la mascota,
 * redundante en imagen (nunca solo texto) para un niño que aún no lee.
 */
export function AudioUnlockGate({ children }: AudioUnlockGateProps) {
  const unlocked = useAudioUnlock();

  if (unlocked) return <>{children}</>;

  return (
    <motion.button
      type="button"
      aria-label="Toca para empezar"
      onClick={unlockAudio}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "var(--space-md)",
        border: "none",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#FDEBD3",
        paddingBottom: "12vh",
      }}
    >
      <img
        src="/illustrations/background.webp"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,247,237,0) 40%, rgba(255,176,59,0.55) 78%, #FFB03B 100%)",
        }}
      />

      {/* Chispas decorativas flotantes */}
      {SPARKLE_POSITIONS.map((pos, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ position: "absolute", left: pos.left, top: pos.top, fontSize: pos.size, zIndex: 1 }}
          animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          ✨
        </motion.span>
      ))}

      <motion.img
        src="/illustrations/mascot.png"
        alt=""
        aria-hidden="true"
        style={{ position: "relative", zIndex: 2, width: "min(58vw, 280px)", filter: "drop-shadow(0 18px 24px rgba(120,60,10,0.28))" }}
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", textShadow: "0 3px 10px rgba(120,60,10,0.4)" }}>
          AndreApp
        </span>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", textShadow: "0 2px 8px rgba(120,60,10,0.4)" }}>
          👉 Toca para empezar
        </span>
      </motion.div>
    </motion.button>
  );
}

const SPARKLE_POSITIONS = [
  { left: "14%", top: "18%", size: "1.6rem" },
  { left: "78%", top: "14%", size: "1.2rem" },
  { left: "22%", top: "38%", size: "1rem" },
  { left: "68%", top: "34%", size: "1.4rem" },
];
