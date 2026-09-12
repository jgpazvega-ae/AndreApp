import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

/** Paleta viva y alegre, tipo fiesta infantil. */
const COLORS = ["#FFB03B", "#4F46E5", "#F58BC0", "#6BD6C2", "#FF6B6B", "#8B7FF5", "#FFD93D", "#FFFFFF"];
const LIFETIME_MS = 950;

type Shape = "circle" | "square" | "star";
const SHAPES: Shape[] = ["circle", "square", "star", "circle", "square"];

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  /** Desplazamiento vertical del "estallido" hacia arriba antes de caer. */
  dy: number;
  /** Caída extra por gravedad al final. */
  fall: number;
  spin: number;
  size: number;
  color: string;
  shape: Shape;
}

let nextParticleId = 0;

/**
 * Ráfaga de confeti para celebrar un acierto. Las partículas estallan
 * desde el punto tocado, suben un poco y caen con gravedad girando —el
 * "papel picado" que hace que un logro se sienta en grande, como en las
 * apps de la referencia. `burst(x, y)` la dispara; `confettiField` es el
 * JSX a renderizar (absoluto, `pointerEvents: none`) dentro de un
 * contenedor `relative`.
 */
export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = useCallback((x: number, y: number, count = 18) => {
    const created: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 55 + Math.random() * 55;
      return {
        id: nextParticleId++,
        x,
        y,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 30, // sesgo hacia arriba al estallar
        fall: 90 + Math.random() * 70,
        spin: (Math.random() - 0.5) * 540,
        size: 8 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        shape: SHAPES[i % SHAPES.length]!,
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
          initial={{ opacity: 1, x: c.x, y: c.y, scale: 0.4, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: c.x + c.dx,
            y: [c.y, c.y + c.dy, c.y + c.dy + c.fall],
            scale: [0.4, 1, 0.7],
            rotate: c.spin,
          }}
          transition={{ duration: LIFETIME_MS / 1000, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: -c.size / 2,
            top: -c.size / 2,
            width: c.size,
            height: c.size,
            borderRadius: c.shape === "circle" ? "50%" : c.shape === "square" ? "2px" : undefined,
            clipPath:
              c.shape === "star"
                ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                : undefined,
            background: c.color,
            pointerEvents: "none",
          }}
        />
      ))}
    </AnimatePresence>
  );

  return { burst, confettiField };
}
