import { motion } from "framer-motion";

/**
 * Manchas decorativas de fondo, a la deriva: un fondo estático se siente
 * "congelado" frente a apps como la de referencia, donde siempre hay algo
 * moviéndose de fondo aunque el niño no toque nada. El movimiento es lento
 * y de bajo contraste — decora sin competir con el objetivo táctil, y
 * `MotionConfig` (App.tsx) lo apaga solo en modo calma / reduced-motion.
 */
export function DecorBlobs() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        style={BLOB_1}
        animate={{ x: [0, 18, -6, 0], y: [0, -14, 6, 0], scale: [1, 1.06, 0.98, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        style={BLOB_2}
        animate={{ x: [0, -14, 10, 0], y: [0, 10, -8, 0], scale: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </>
  );
}

const BLOB_1: React.CSSProperties = {
  position: "absolute",
  top: "-10%",
  right: "-15%",
  width: "50vw",
  height: "50vw",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.18)",
  pointerEvents: "none",
};

const BLOB_2: React.CSSProperties = {
  position: "absolute",
  bottom: "-15%",
  left: "-10%",
  width: "40vw",
  height: "40vw",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.12)",
  pointerEvents: "none",
};
