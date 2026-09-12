import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export interface HubHeaderIcon {
  icon: string;
  left: string;
  top: string;
  size: string;
  duration: number;
}

interface HubHeaderProps {
  title: string;
  onBack: () => void;
  /** Degradado propio de la sección (mismo color que su tile en Home). */
  gradient: [string, string];
  /** Íconos decorativos que respiran en el espacio vacío del encabezado. */
  icons?: HubHeaderIcon[];
}

/**
 * Encabezado con degradado compartido por las 4 secciones de nivel superior
 * (Jugar, Explorar, Aprender, Favoritos): antes cada una tenía su propio
 * header blanco plano copiado y pegado, la única parte de la app sin color
 * propio (Home, un Mundo y un nivel sí lo tienen). Extraído aquí para que
 * las 4 se vean como el mismo lugar de la app en vez de reinventar el header
 * cada vez, y para que un ajuste futuro (p. ej. accesibilidad del botón de
 * regreso) se aplique una sola vez.
 */
export function HubHeader({ title, onBack, gradient, icons = [] }: HubHeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "max(env(safe-area-inset-top), var(--space-md)) var(--space-md) var(--space-lg)",
        background: `linear-gradient(160deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
      }}
    >
      {icons.map((item, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: item.left,
            top: item.top,
            fontSize: item.size,
            pointerEvents: "none",
          }}
          animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
        >
          {item.icon}
        </motion.span>
      ))}

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        <motion.button
          type="button"
          aria-label={t("common.back")}
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-pill)",
            background: "rgba(255,255,255,0.85)",
            boxShadow: "var(--shadow-soft)",
            fontSize: "1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⬅️
        </motion.button>
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
          {title}
        </div>
      </div>
    </header>
  );
}
