import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

const COLORS = ["#FFB03B", "#4F46E5", "#F58BC0", "#6BD6C2", "#FFFFFF"];
const LIFETIME_MS = 700;

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

let nextParticleId = 0;

/**
 * Ráfaga de confeti reutilizable para celebrar un acierto (N1, N2, N3...).
 * Devuelve `burst(x, y)` para disparar la animación en un punto de la
 * pantalla, y `confettiField` — el JSX a renderizar (posicionado
 * absolutamente, `pointerEvents: none`) dentro de un contenedor `relative`.
 */
export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = useCallback((x: number, y: number, count = 8) => {
    const created: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const distance = 50 + Math.random() * 40;
      return {
        id: nextParticleId++,
        x,
        y,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length]!,
      };
    });
    setParticles((prev) => [...prev, ...created]);
    setTimeout(() => {
      const ids = new Set(created.map((c) => c.id));
      setParticles((prev) => prev.filter((c) => !ids.has(c.id)));
    }, LIFETIME_MS);
  }, []);

  const confettiField = (
    <AnimatePresence>
      {particles.map((c) => (
        <motion.span
          key={c.id}
          aria-hidden="true"
          initial={{ opacity: 1, x: c.x - 5, y: c.y - 5, scale: 1 }}
          animate={{ opacity: 0, x: c.x + c.dx, y: c.y + c.dy, scale: 0.3 }}
          transition={{ duration: LIFETIME_MS / 1000, ease: "easeOut" }}
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
  );

  return { burst, confettiField };
}
