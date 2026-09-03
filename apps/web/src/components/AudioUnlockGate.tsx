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
 * (PLAN.md §2). También sirve como bienvenida amigable y redundante en
 * ícono (sol grande) para un niño que aún no lee.
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
      transition={{ duration: 0.4 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        background:
          "radial-gradient(circle at 50% 40%, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        border: "none",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <motion.span
        aria-hidden="true"
        style={{ fontSize: "6rem" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        ☀️
      </motion.span>
      <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>AndreApp</span>
    </motion.button>
  );
}
