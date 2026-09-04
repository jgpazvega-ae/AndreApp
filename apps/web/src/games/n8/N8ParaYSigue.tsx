import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom } from "../../utils/random";
import { useGameSession } from "../useGameSession";

type Phase = "dancing" | "frozen";

const BACKGROUND = "linear-gradient(160deg, #E9E4FF 0%, #C7B8FF 100%)";
const DANCE_MIN_MS = 1800;
const DANCE_MAX_MS = 3200;
/** Ventana en la que el congelamiento acepta el toque antes de volver a bailar solo. */
const FREEZE_WINDOW_MS = 2500;
/** docs/CURRICULUM.md ficha N8: "se congela en 3 señales seguidas". */
const STREAK_TARGET = 3;

/** Reutiliza los elogios de proceso de N2 para celebrar la racha completa. */
const STREAK_COMPLETE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

function randomDanceDuration(): number {
  return DANCE_MIN_MS + Math.random() * (DANCE_MAX_MS - DANCE_MIN_MS);
}

interface N8ParaYSigueProps {
  locale: string;
  onExit: () => void;
}

/**
 * N8 · Para y sigue (docs/CURRICULUM.md ficha N8, control inhibitorio).
 * La mascota baila sola; cuando se congela (con un tono como señal audible,
 * redundante con la señal visual) hay que tocarla. Tocar mientras baila
 * solo se escucha (acknowledgeTap), sin romper la racha ni castigar — es
 * una invitación a esperar, no un error. No escala de velocidad (a
 * diferencia de N2): aquí el reto es la espera, no la puntería.
 */
export function N8ParaYSigue({ locale, onExit }: N8ParaYSigueProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("dancing");
  const [streak, setStreak] = useState(0);
  const [caught, setCaught] = useState(false);
  const { acknowledgeTap, celebrate, celebrateSignal, confettiField } = useGameSession("n8", {
    locale,
    welcomeFile: "n8-welcome.mp3",
  });

  // Alterna las fases: bailando por un tiempo al azar, luego congelada por
  // una ventana fija que, si nadie toca, vuelve a bailar sin penalizar.
  useEffect(() => {
    if (phase === "dancing") {
      const t = setTimeout(() => {
        setCaught(false);
        setPhase("frozen");
        playChime(); // señal audible del congelamiento, redundante con la visual
      }, randomDanceDuration());
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("dancing"), FREEZE_WINDOW_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (phase === "dancing") {
        acknowledgeTap();
        return;
      }
      if (caught) return;
      setCaught(true);
      celebrate(event);
      setPhase("dancing");
      setStreak((s) => {
        const next = s + 1;
        if (next >= STREAK_TARGET) {
          setTimeout(() => playVoiceClip(locale, pickRandom(STREAK_COMPLETE_FILES)), 300);
          return 0;
        }
        return next;
      });
    },
    [phase, caught, locale, acknowledgeTap, celebrate],
  );

  return (
    <GameShell
      levelId="n8"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          position: "absolute",
          top: "calc(max(env(safe-area-inset-top), 16px) + 64px)",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          zIndex: 1,
        }}
      >
        {Array.from({ length: STREAK_TARGET }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: i < streak ? "var(--color-accent)" : "rgba(255,255,255,0.6)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence>
          {phase === "dancing" &&
            NOTE_POSITIONS.map((pos, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                style={{ position: "absolute", left: pos.x, top: pos.y, fontSize: "1.6rem", pointerEvents: "none" }}
              >
                🎵
              </motion.span>
            ))}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "frozen" && (
            <motion.div
              key="glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          // El nombre accesible anuncia el turno: quien acompaña a un niño que usa
          // lector de pantalla necesita saber cuándo tocar, no solo verlo congelarse.
          aria-label={t(phase === "frozen" ? "a11y.dancerFrozen" : "a11y.dancer")}
          onPointerDown={handleTap}
          animate={
            phase === "dancing"
              ? { x: [-16, 16, -16], rotate: [-9, 9, -9], y: [0, -8, 0] }
              : { x: 0, rotate: 0, y: 0, scale: [1, 1.08, 1] }
          }
          // x/y/rotate vuelven a 0 al instante (duration: 0), no con un deslizamiento
          // suave: "congelarse" es un alto abrupto, no una desaceleración — y de
          // paso evita que el punto de toque persiga un objetivo que todavía se
          // está moviendo cuando el niño (o esta prueba) apenas detecta el cambio.
          transition={
            phase === "dancing"
              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
              : {
                  x: { duration: 0 },
                  y: { duration: 0 },
                  rotate: { duration: 0 },
                  scale: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
                }
          }
          style={{
            position: "relative",
            width: 160,
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <img
            src={asset("illustrations/mascot.png")}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 16px rgba(80,60,140,0.3))",
            }}
          />
        </motion.button>
      </div>
    </GameShell>
  );
}

const NOTE_POSITIONS = [
  { x: -70, y: 20 },
  { x: 60, y: -10 },
  { x: -20, y: 60 },
];
