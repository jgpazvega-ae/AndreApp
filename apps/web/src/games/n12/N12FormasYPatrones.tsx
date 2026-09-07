import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { ReplayQuestionButton } from "../../components/ReplayQuestionButton";
import { ShapeIcon, type ShapeType } from "../../components/ShapeIcon";
import { shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { useTimers } from "../useTimers";

const ALL_SHAPES: [ShapeType, ...ShapeType[]] = ["circle", "square", "triangle", "star"];
const BACKGROUND = "linear-gradient(160deg, #DFF3FF 0%, #7EC8F0 100%)";
const SHAKE_MS = 400;
/** Cuánto queda visible la forma correcta rellenando el hueco antes de pasar al siguiente patrón. */
const NEXT_PATTERN_DELAY_MS = 1400;

interface Round {
  /** Los 4 primeros lugares del patrón, ya llenos: A,B,A,B — el 5to queda como hueco a completar. */
  sequence: [ShapeType, ShapeType, ShapeType, ShapeType];
  /** La forma que continúa el patrón (A, la misma que el 1er y 3er lugar). */
  answer: ShapeType;
  /** 3 opciones para tocar, en orden aleatorio: la correcta, B (el error típico de "repetir lo último
   * que vio" en vez de seguir la alternancia) y una forma que no aparece en el patrón. */
  options: ShapeType[];
}

function newRound(): Round {
  const [a, b, distractor] = shuffle(ALL_SHAPES);
  return {
    sequence: [a!, b!, a!, b!],
    answer: a!,
    options: shuffle([a!, b!, distractor!]),
  };
}

interface N12FormasYPatronesProps {
  locale: string;
  onExit: () => void;
}

/**
 * N12 · Formas y patrones (docs/CURRICULUM.md ficha N12: reconocer formas y
 * completar patrones ABAB — "🔴🔵🔴🔵__"). El patrón se muestra siempre
 * alternando 2 formas (A,B,A,B); el niño toca la forma que sigue. Reconocer
 * formas es un requisito implícito para resolver el patrón, no un ejercicio
 * aparte — N6 ya enseña emparejar formas por sí solas.
 *
 * Las 3 opciones son deliberadas: la correcta (A), la última que se vio (B —
 * el error típico de repetir en vez de alternar) y una forma ajena al
 * patrón. Sin voz que nombre la forma (a diferencia de N4/N5/N7/N9): lo que
 * se enseña aquí es razonamiento sobre el patrón, no vocabulario, y la
 * recompensa visual (el hueco se rellena) ya confirma el acierto.
 */
export function N12FormasYPatrones({ locale, onExit }: N12FormasYPatronesProps) {
  const { t } = useTranslation();
  const [round, setRound] = useState<Round>(() => newRound());
  const [filled, setFilled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shakeShape, setShakeShape] = useState<ShapeType | null>(null);
  const { after } = useTimers();
  const { celebrate, encourage, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n12", {
    locale,
    welcomeFile: "n12-welcome.mp3",
  });

  const handleTapOption = useCallback(
    (shape: ShapeType, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (shape !== round.answer) {
        // Se sacude Y se anima a seguir intentando: el patrón sigue en pie.
        encourage();
        setShakeShape(shape);
        after(SHAKE_MS, () => setShakeShape(null));
        return;
      }

      setBusy(true);
      setFilled(true);
      celebrate(event);
      after(NEXT_PATTERN_DELAY_MS, () => {
        setRound(newRound());
        setFilled(false);
        setBusy(false);
      });
    },
    [busy, round.answer, celebrate, encourage, after],
  );

  return (
    <GameShell
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <ReplayQuestionButton onReplay={() => !busy && playVoiceClip(locale, "n12-welcome.mp3")} />

      {/* El patrón: 4 lugares llenos y un hueco punteado al final, igual
          lenguaje visual que el hueco de N6 (ShapeIcon variant="slot"). */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-lg) var(--space-sm) 0",
        }}
      >
        {round.sequence.map((shape, i) => (
          <div key={i} style={{ width: "16vw", maxWidth: 72, aspectRatio: "1" }}>
            <ShapeIcon type={shape} variant="piece" />
          </div>
        ))}
        <motion.div
          key={filled ? `filled-${round.answer}` : "empty"}
          initial={filled ? { scale: 0.5, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 18 }}
          style={{ width: "16vw", maxWidth: 72, aspectRatio: "1" }}
        >
          <ShapeIcon type={round.answer} variant={filled ? "piece" : "slot"} />
        </motion.div>
      </div>

      {/* Opciones para tocar: 3 formas, la correcta entre ellas en orden al azar. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-lg)",
          padding: "0 var(--space-md)",
        }}
      >
        {round.options.map((shape, i) => (
          <motion.button
            key={shape + i}
            type="button"
            aria-label={t("a11y.shapeOption")}
            onPointerDown={(e) => handleTapOption(shape, e)}
            animate={shakeShape === shape ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: SHAKE_MS / 1000 }}
            whileTap={{ scale: 0.88 }}
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-sm)",
              width: "24vw",
              maxWidth: 108,
              aspectRatio: "1",
            }}
          >
            <ShapeIcon type={shape} variant="piece" />
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
