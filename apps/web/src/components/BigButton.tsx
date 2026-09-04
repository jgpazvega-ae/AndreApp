import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BigButtonProps {
  icon: ReactNode;
  label: string;
  onTap: () => void;
  /** Degradado de color del tile (p. ej. por etapa). Ignorado si `locked`. */
  gradient?: [string, string];
  locked?: boolean;
  disabled?: boolean;
  /** Índice para escalonar la animación de entrada (stagger). */
  delayIndex?: number;
}

/**
 * Botón táctil grande (≥64px), redundante en ícono (nunca depende solo de
 * texto ni solo de color) — docs/CURRICULUM.md §2/§9. Con degradado,
 * brillo decorativo y entrada animada para dar más "vida" a la interfaz.
 */
export function BigButton({
  icon,
  label,
  onTap,
  gradient = ["var(--color-primary)", "var(--color-primary-dark)"],
  locked = false,
  disabled = false,
  delayIndex = 0,
}: BigButtonProps) {
  const background = locked
    ? "var(--color-locked-bg)"
    : `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%), linear-gradient(160deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
  const fg = locked ? "var(--color-locked-text)" : "#fff";

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onTap}
      initial={{ opacity: 0, y: 18, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: delayIndex * 0.045, ease: [0.22, 1, 0.36, 1] }}
      whileTap={disabled ? undefined : { scale: 0.9, rotate: -2 }}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      style={{
        position: "relative",
        minWidth: "var(--touch-target-min)",
        minHeight: "var(--touch-target-min)",
        borderRadius: "var(--radius-lg)",
        background,
        color: fg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "var(--space-md) var(--space-sm)",
        boxShadow: locked
          ? "inset 0 2px 4px rgba(58,46,34,0.08)"
          : "0 10px 0 -2px rgba(0,0,0,0.08), var(--shadow-soft)",
        border: locked ? "2px dashed rgba(169,153,138,0.4)" : "2px solid rgba(255,255,255,0.35)",
        opacity: disabled && !locked ? 0.6 : 1,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "2.6rem",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "2.8rem",
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span
        style={{ fontSize: "0.82rem", fontWeight: 800, textShadow: locked ? "none" : "0 1px 3px rgba(0,0,0,0.18)" }}
      >
        {label}
      </span>
    </motion.button>
  );
}
