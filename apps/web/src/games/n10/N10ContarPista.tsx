import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom } from "../../utils/random";
import { useGameSession } from "../useGameSession";

const CHECKPOINTS = [1, 2, 3, 4, 5] as const;
type Checkpoint = (typeof CHECKPOINTS)[number];

/** Reutiliza los objetos de N1/N3: lo que cambia es la cantidad a contar, no la figura. */
const OBJECT_IMAGES: [string, ...string[]] = [
  asset("illustrations/object-star.png"),
  asset("illustrations/object-bell.png"),
  asset("illustrations/object-balloon.png"),
  asset("illustrations/object-flower.png"),
];

const COUNT_FILE: Record<Checkpoint, string> = {
  1: "n10-count-1.mp3",
  2: "n10-count-2.mp3",
  3: "n10-count-3.mp3",
  4: "n10-count-4.mp3",
  5: "n10-count-5.mp3",
};

const CAR_IMAGE = asset("illustrations/car.png");
const BACKGROUND = "linear-gradient(160deg, #FFE9C7 0%, #FFC26B 100%)";
/** Espera tras contar el último objeto de una parada antes de que el carro avance. */
const CHECKPOINT_ADVANCE_MS = 1100;
/** La voz especial de meta suena después del elogio genérico de la pantalla de
 * logro (que sale a los 300ms de useGameSession): así no se atropellan. */
const FINISH_VOICE_DELAY_MS = 1800;

interface N10ContarPistaProps {
  locale: string;
  onExit: () => void;
}

/**
 * N10 · Contar 1-5, "la pista de números" (docs/CURRICULUM.md ficha N10:
 * correspondencia uno a uno y cardinalidad — un toque = un objeto = un
 * número dicho). El carro recorre 5 paradas; la parada K tiene K objetos
 * para tocar uno por uno. El último número contado en cada parada ES el
 * total (el principio de cardinalidad no necesita un anuncio aparte). Al
 * completar una parada el carro avanza con una celebración; al llegar a
 * la quinta (la meta), con 5 celebraciones ya ocurridas, la pantalla de
 * logro compartida cierra la ronda exactamente cuando cruza la meta.
 */
export function N10ContarPista({ locale, onExit }: N10ContarPistaProps) {
  const { t } = useTranslation();
  const [checkpointIndex, setCheckpointIndex] = useState(0); // 0..4 → parada 1..5
  const [image, setImage] = useState(() => pickRandom(OBJECT_IMAGES));
  const [countedIds, setCountedIds] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n10", {
    locale,
    welcomeFile: "n10-welcome.mp3",
  });

  const arrived = checkpointIndex >= CHECKPOINTS.length; // ya cruzó la meta: la pantalla de logro cubre todo aquí
  // Cae de vuelta a la última parada si arrived (nunca se renderiza: el overlay tapa todo), solo para que TS no vea "undefined".
  const checkpoint: Checkpoint = CHECKPOINTS[checkpointIndex] ?? 5;
  const objectIds = Array.from({ length: checkpoint }, (_, i) => i);

  const handleTapObject = useCallback(
    (id: number, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy || countedIds.has(id)) return; // ya contado: se ignora, sin castigar el re-toque

      const nextCounted = new Set(countedIds).add(id);
      setCountedIds(nextCounted);
      playChime();
      playVoiceClip(locale, COUNT_FILE[checkpoint]);

      if (nextCounted.size < checkpoint) return; // aún faltan objetos por contar en esta parada

      // Parada completa: celebración (el carro "arriba") y, tras una pausa, avanza.
      setBusy(true);
      celebrate(event);
      const isLastCheckpoint = checkpointIndex === CHECKPOINTS.length - 1;
      if (isLastCheckpoint) {
        timers.current.push(setTimeout(() => playVoiceClip(locale, "n10-finish.mp3"), FINISH_VOICE_DELAY_MS));
      }
      timers.current.push(
        setTimeout(() => {
          setCheckpointIndex((i) => i + 1);
          setCountedIds(new Set());
          setImage(pickRandom(OBJECT_IMAGES));
          setBusy(false);
        }, CHECKPOINT_ADVANCE_MS),
      );
    },
    [busy, countedIds, checkpoint, checkpointIndex, locale, celebrate],
  );

  /** "Otra vez" en la pantalla de logro reinicia la vuelta desde la primera
   * parada: a diferencia de otros niveles, aquí una ronda ES una vuelta
   * completa (salida → 5 paradas → meta), así que "seguir jugando" quiere
   * decir "otra vuelta", no "reanudar a medias". */
  const handlePlayAgain = useCallback(() => {
    continueRound();
    setCheckpointIndex(0);
    setCountedIds(new Set());
    setImage(pickRandom(OBJECT_IMAGES));
  }, [continueRound]);

  // Posición del carro en la pista, de 0 (salida) a 100 (meta), con una parada por punto.
  const carPercent = (Math.min(checkpointIndex, CHECKPOINTS.length) / CHECKPOINTS.length) * 100;

  return (
    <GameShell
      levelId="n10"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={handlePlayAgain}
    >
      {/* Mini-pista: inicio, 5 paradas numeradas y meta, con el carro
          avanzando sobre ella — puramente decorativo/de progreso. */}
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          zIndex: 1,
          margin: "calc(max(env(safe-area-inset-top), 16px) + 60px) var(--space-lg) 0",
          height: 46,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 6,
            transform: "translateY(-50%)",
            borderRadius: 3,
            background: "rgba(255,255,255,0.55)",
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1.3rem" }}>🏁</span>
          {CHECKPOINTS.map((n, i) => {
            const done = i < checkpointIndex;
            const current = i === checkpointIndex && !arrived;
            return (
              <div
                key={n}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: done || current ? "#fff" : "var(--color-text-muted)",
                  background: done ? "#2E9C6A" : current ? "var(--color-accent)" : "rgba(255,255,255,0.7)",
                  boxShadow: current ? "0 0 0 4px rgba(79,70,229,0.25)" : "none",
                }}
              >
                {done ? "✓" : n}
              </div>
            );
          })}
          <span style={{ fontSize: "1.3rem" }}>🏁</span>
        </div>
        <motion.img
          src={CAR_IMAGE}
          alt=""
          animate={{ left: `${carPercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          style={{
            position: "absolute",
            top: -20,
            width: 46,
            height: "auto",
            marginLeft: -14,
            filter: "drop-shadow(0 6px 8px rgba(120,60,10,0.3))",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Objetos de la parada actual: un toque = un objeto = un número dicho
          (docs/CURRICULUM.md ficha N10). Nunca desaparecen del todo — se
          quedan atenuados con una palomita, por si el niño quiere recontar. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          gap: "var(--space-md)",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={checkpointIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-md)" }}
          >
            {objectIds.map((id) => {
              const isCounted = countedIds.has(id);
              return (
                <motion.button
                  key={id}
                  type="button"
                  aria-label={isCounted ? t("a11y.trackObjectCounted") : t("a11y.trackObject")}
                  onPointerDown={(e) => handleTapObject(id, e)}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: isCounted ? [1, 1.25, 1] : 1, opacity: 1 }}
                  transition={{ scale: { duration: 0.3 }, opacity: { duration: 0.2, delay: id * 0.05 } }}
                  whileTap={isCounted ? undefined : { scale: 0.9 }}
                  style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    padding: 0,
                    width: "26vw",
                    maxWidth: 108,
                    aspectRatio: "1",
                  }}
                >
                  <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      opacity: isCounted ? 0.55 : 1,
                      filter: "drop-shadow(0 8px 10px rgba(140,80,10,0.25))",
                      transition: "opacity 0.3s",
                    }}
                  />
                  {isCounted && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: -2,
                        top: -2,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "#2E9C6A",
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
