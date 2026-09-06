import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { playSound } from "../audio/audioEngine";
import { getBuddy } from "../data/buddies";
import { useProgressStore } from "../store/progressStore";

/** Evita que aciertos muy seguidos amontonen ladridos encima uno del otro. */
const BARK_COOLDOWN_MS = 1200;

interface GameBuddyProps {
  /** Incrementar este número desde el juego dispara la animación de festejo. */
  celebrateSignal: number;
}

/**
 * Compañero perruno que se asoma en la esquina del juego: es el que el niño
 * eligió en la pantalla de inicio (ver HomeScreen/progressStore), no una
 * rotación anónima por nivel — así el mismo amigo lo acompaña en todos los
 * juegos. Respira en reposo con un estilo propio de su personalidad y salta
 * a festejar (con su propio ladrido) cuando el niño acierta.
 */
export function GameBuddy({ celebrateSignal }: GameBuddyProps) {
  const selectedBuddy = useProgressStore((state) => state.selectedBuddy);
  const buddy = getBuddy(selectedBuddy);
  const [cheering, setCheering] = useState(false);
  const mounted = useRef(false);
  const lastBarkAt = useRef(0);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setCheering(true);
    const now = Date.now();
    if (now - lastBarkAt.current > BARK_COOLDOWN_MS) {
      lastBarkAt.current = now;
      playSound(buddy.barkSound);
    }
    const timeout = window.setTimeout(() => setCheering(false), 700);
    return () => window.clearTimeout(timeout);
    // Solo debe reaccionar al festejo, no a que cambie de compañero a medio festejo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrateSignal]);

  return (
    <motion.img
      key={buddy.id}
      src={buddy.image}
      alt=""
      aria-hidden="true"
      animate={cheering ? { y: [0, -22, 0], rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : idleAnimation(buddy.id)}
      transition={cheering ? { duration: 0.7, ease: "easeInOut" } : idleTransition(buddy.id)}
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

/**
 * Reposo con acento propio: Kira brinca de verdad (busca atención), Odie es
 * más inquieto/rápido (juguetón), Dante apenas se mece (tranquilo, sabio).
 */
function idleAnimation(id: string) {
  if (id === "kira") return { y: [0, -14, 0], scale: [1, 1.04, 1] };
  if (id === "odie") return { y: [0, -8, 0], rotate: [0, -4, 4, 0] };
  return { y: [0, -3, 0] };
}

function idleTransition(id: string) {
  if (id === "kira") return { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const };
  if (id === "odie") return { duration: 1.7, repeat: Infinity, ease: "easeInOut" as const };
  return { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const };
}
