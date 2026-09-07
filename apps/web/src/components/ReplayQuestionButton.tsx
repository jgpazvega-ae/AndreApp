import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ReplayQuestionButtonProps {
  onReplay: () => void;
}

/**
 * Altavoz flotante para volver a oír la consigna hablada de un nivel de
 * comprensión auditiva ("¿dónde está el perro?", "¿quién está feliz?",
 * "¿dónde hay dos?") — sin esto, un niño que la olvida (a esta edad es
 * comprensión receptiva, no memoria) se quedaba sin forma de volver a oírla
 * salvo equivocándose a propósito.
 *
 * No cubre la variante de N4: ahí el altavoz REEMPLAZA el objetivo tocable
 * de la fase nombrada (tamaño e integración con su propia sacudida), no es
 * un botón utilitario aparte como aquí.
 */
export function ReplayQuestionButton({ onReplay }: ReplayQuestionButtonProps) {
  const { t } = useTranslation();
  return (
    <motion.button
      type="button"
      aria-label={t("a11y.replayQuestion")}
      onClick={onReplay}
      whileTap={{ scale: 0.88 }}
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "relative",
        zIndex: 1,
        alignSelf: "center",
        marginTop: "max(env(safe-area-inset-top), 16px)",
        width: 52,
        height: 52,
        borderRadius: "var(--radius-pill)",
        background: "rgba(255,255,255,0.85)",
        fontSize: "1.5rem",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      🔊
    </motion.button>
  );
}
