import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { asset } from "../utils/asset";

/**
 * Los 3 perritos de la familia, convertidos en personajes de la app
 * (a petición del usuario). Cada nivel tiene asignado un compañero fijo
 * (ver buddyForLevel) para que el niño los reconozca nivel a nivel.
 */
const BUDDY_FILES = ["illustrations/friend-1.png", "illustrations/friend-2.png", "illustrations/friend-3.png"];

export function buddyForLevel(levelId: string): string {
  const num = parseInt(levelId.replace(/\D/g, ""), 10) || 0;
  return BUDDY_FILES[num % BUDDY_FILES.length]!;
}

interface GameBuddyProps {
  levelId: string;
  /** Incrementar este número desde el juego dispara la animación de festejo. */
  celebrateSignal: number;
}

/**
 * Compañero perruno que se asoma en la esquina del juego: hace una
 * respiración/flote suave en reposo y salta a festejar cuando el niño
 * acierta (celebrateSignal cambia). Puramente decorativo/motivacional,
 * no lleva audio propio para no competir con la voz del juego.
 */
export function GameBuddy({ levelId, celebrateSignal }: GameBuddyProps) {
  const [cheering, setCheering] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setCheering(true);
    const timeout = window.setTimeout(() => setCheering(false), 700);
    return () => window.clearTimeout(timeout);
  }, [celebrateSignal]);

  return (
    <motion.img
      src={asset(buddyForLevel(levelId))}
      alt=""
      aria-hidden="true"
      animate={
        cheering
          ? { y: [0, -22, 0], rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }
          : { y: [0, -6, 0], rotate: [0, -2, 2, 0] }
      }
      transition={
        cheering ? { duration: 0.7, ease: "easeInOut" } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
      }
      style={{
        position: "absolute",
        top: "max(env(safe-area-inset-top), 16px)",
        right: 16,
        zIndex: 10,
        width: 56,
        height: "auto",
        pointerEvents: "none",
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.2))",
      }}
    />
  );
}
