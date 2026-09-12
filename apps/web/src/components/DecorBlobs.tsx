import { motion } from "framer-motion";

/**
 * Escena de fondo compartida por todos los niveles: manchas a la deriva,
 * un par de nubes que flotan arriba y un suave degradado de "suelo" abajo.
 *
 * Existe porque, comparados con la app de referencia, nuestros juegos
 * dejaban la mitad de la pantalla como un rectángulo de color liso vacío
 * (la mecánica ocupa poco espacio, el resto no tenía nada) — eso es lo que
 * hace que una pantalla se sienta a medio construir. Todo aquí es
 * `aria-hidden` y `pointerEvents: none`: decora sin competir jamás con el
 * objetivo táctil (docs/CURRICULUM.md §2). Usar dentro de un contenedor
 * `position: relative`.
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

      {CLOUDS.map((cloud, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: cloud.left,
            top: cloud.top,
            fontSize: cloud.size,
            opacity: 0.5,
            pointerEvents: "none",
          }}
          animate={{ x: [0, 24, 0] }}
          transition={{ duration: 18 + i * 5, repeat: Infinity, ease: "easeInOut", delay: i * 2.5 }}
        >
          ☁️
        </motion.span>
      ))}

      {/* Suelo: un lavado suave abajo para que la mitad inferior de la pantalla
          (donde la mecánica casi nunca llega) no se sienta vacía. */}
      <div aria-hidden="true" style={GROUND} />
    </>
  );
}

const CLOUDS = [
  { left: "8%", top: "58%", size: "2.6rem" },
  { left: "70%", top: "70%", size: "2rem" },
];

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

const GROUND: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: "22%",
  background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 100%)",
  pointerEvents: "none",
};
