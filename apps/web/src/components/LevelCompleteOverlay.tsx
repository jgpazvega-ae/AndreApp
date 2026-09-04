import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../audio/audioEngine";
import { pickRandom } from "../utils/random";

/** Mismos elogios de proceso que varios niveles ya reutilizan para sus propios
 * cierres de ronda: consistente en toda la app, sin generar audio nuevo. */
const PRAISE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

interface LevelCompleteOverlayProps {
  visible: boolean;
  locale: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

/**
 * Pantalla de logro al cerrar una ronda (ver useGameSession.roundSize).
 * Existe porque, sin ella, cada nivel era un ejercicio infinito sin
 * principio ni fin: el niño nunca sentía que "terminó" algo, a diferencia
 * de la app de referencia. Siempre son 3 estrellas — nunca menos, nunca
 * evaluativo (docs/CURRICULUM.md §2: elogio de proceso, nunca examen).
 * Cubre toda la pantalla y pausa el juego de fondo sin reiniciarlo: "otra
 * vez" solo la cierra y el nivel sigue donde estaba.
 */
export function LevelCompleteOverlay({ visible, locale, onPlayAgain, onGoHome }: LevelCompleteOverlayProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => playVoiceClip(locale, pickRandom(PRAISE_FILES)), 300);
    return () => clearTimeout(timer);
  }, [visible, locale]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="level-complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          // N1 escucha toques en toda la pantalla (igual que el botón "regresar"
          // de GameShell, ver su propio comentario): sin frenar aquí, tocar
          // "otra vez"/"mapa" también burbujea como un acierto de fondo.
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-md)",
            background: "rgba(58,46,34,0.45)",
            backdropFilter: "blur(2px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
            style={{
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-lg) var(--space-lg) var(--space-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-sm)",
              boxShadow: "var(--shadow-soft)",
              maxWidth: 320,
              width: "82vw",
            }}
          >
            <div style={{ display: "flex", gap: 4 }} aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 12, delay: 0.25 + i * 0.18 }}
                  style={{ fontSize: "2.6rem" }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-text)", textAlign: "center" }}>
              {t("roundComplete.title")}
            </div>

            <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-xs)" }}>
              <motion.button
                type="button"
                onClick={onPlayAgain}
                whileTap={{ scale: 0.92 }}
                style={{
                  minWidth: "var(--touch-target-min)",
                  minHeight: "var(--touch-target-min)",
                  borderRadius: "var(--radius-md)",
                  background:
                    "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 42%), linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "var(--space-sm)",
                  border: "2px solid rgba(255,255,255,0.35)",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "1.6rem" }}>
                  🔁
                </span>
                <span style={{ fontSize: "0.78rem" }}>{t("roundComplete.playAgain")}</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={onGoHome}
                whileTap={{ scale: 0.92 }}
                style={{
                  minWidth: "var(--touch-target-min)",
                  minHeight: "var(--touch-target-min)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontWeight: 800,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "var(--space-sm)",
                  border: "2px solid rgba(58,46,34,0.15)",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "1.6rem" }}>
                  🏠
                </span>
                <span style={{ fontSize: "0.78rem" }}>{t("roundComplete.goHome")}</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
