import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BigButtonProps {
  icon: ReactNode;
  label: string;
  onTap: () => void;
  variant?: "primary" | "accent" | "locked";
  disabled?: boolean;
}

/**
 * Botón táctil grande (≥64px), redundante en ícono (nunca depende solo de
 * texto ni solo de color) — docs/CURRICULUM.md §2/§9.
 */
export function BigButton({ icon, label, onTap, variant = "primary", disabled = false }: BigButtonProps) {
  const bg =
    variant === "locked" ? "var(--color-locked-bg)" : variant === "accent" ? "var(--color-accent)" : "var(--color-primary)";
  const fg = variant === "locked" ? "var(--color-locked-text)" : "#fff";

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onTap}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ duration: 0.15 }}
      style={{
        minWidth: "var(--touch-target-min)",
        minHeight: "var(--touch-target-min)",
        borderRadius: "var(--radius-lg)",
        background: bg,
        color: fg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "var(--space-md)",
        boxShadow: disabled ? "none" : "var(--shadow-soft)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: "2.5rem", lineHeight: 1 }} aria-hidden="true">
        {icon}
      </span>
      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{label}</span>
    </motion.button>
  );
}
