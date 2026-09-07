import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { playSound } from "../audio/audioEngine";
import { getBuddy } from "../data/buddies";
import { BUDDY_CHEER_MS, buddyCheer, buddyCheerTransition, buddyIdle, buddyIdleTransition } from "../data/buddyMotion";
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
 * juegos. Respira en reposo y festeja el acierto del niño con el movimiento
 * y el ladrido de SU carácter, no con un saltito genérico (ver buddyMotion).
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
    const timeout = window.setTimeout(() => setCheering(false), BUDDY_CHEER_MS[buddy.id]);
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
      animate={cheering ? buddyCheer(buddy.id) : buddyIdle(buddy.id)}
      transition={cheering ? buddyCheerTransition(buddy.id) : buddyIdleTransition(buddy.id)}
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
