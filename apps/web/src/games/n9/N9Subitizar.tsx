import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom, pickRandomExcept, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { useIdleHint } from "../useIdleHint";

type Quantity = 1 | 2 | 3;

const ALL_QUANTITIES: [Quantity, ...Quantity[]] = [1, 2, 3];

/**
 * Objetos reutilizados de N1/N3: cambiar el objeto entre rondas es "repetición
 * con variación" (docs/CURRICULUM.md §6) — lo que se entrena es la CANTIDAD,
 * así que la figura debe variar para que el niño no memorice una sola imagen.
 */
const OBJECT_IMAGES: [string, ...string[]] = [
  asset("illustrations/object-star.png"),
  asset("illustrations/object-bell.png"),
  asset("illustrations/object-balloon.png"),
  asset("illustrations/object-flower.png"),
];

const QUESTION_FILE: Record<Quantity, string> = {
  1: "n9-question-1.mp3",
  2: "n9-question-2.mp3",
  3: "n9-question-3.mp3",
};
const EXCLAIM_FILE: Record<Quantity, string> = {
  1: "n9-exclaim-1.mp3",
  2: "n9-exclaim-2.mp3",
  3: "n9-exclaim-3.mp3",
};

/**
 * Posiciones canónicas tipo dado. Subitizar es reconocer la FORMA del grupo de
 * un vistazo, así que la disposición de cada cantidad es SIEMPRE la misma (no
 * aleatoria): es justamente el patrón lo que el niño aprende a leer.
 */
const LAYOUT: Record<Quantity, { left: string; top: string }[]> = {
  1: [{ left: "50%", top: "50%" }],
  2: [
    { left: "32%", top: "32%" },
    { left: "68%", top: "68%" },
  ],
  3: [
    { left: "50%", top: "26%" },
    { left: "29%", top: "70%" },
    { left: "71%", top: "70%" },
  ],
};

const BACKGROUND = "linear-gradient(160deg, #EDE9FF 0%, #B3A6F5 100%)";
const SHAKE_MS = 400;
const NEXT_QUESTION_DELAY_MS = 1800;

interface N9SubitizarProps {
  locale: string;
  onExit: () => void;
}

/**
 * N9 · Subitizar 1-3 (docs/CURRICULUM.md ficha N9).
 * "¿Dónde hay dos?" → tocar el grupo con esa cantidad. Las 3 opciones (1, 2 y
 * 3 objetos) están siempre visibles y NO desaparecen: el andamiaje de la ficha
 * es "exposición breve → si duda, se permite contar", y para eso los objetos
 * tienen que seguir ahí para contarlos con el dedo si hace falta. Tocar el
 * grupo equivocado solo lo sacude, sin sonido negativo; la pregunta sigue en
 * pie hasta acertar. Tras ~5 s sin tocar, el grupo correcto late como pista.
 */
export function N9Subitizar({ locale, onExit }: N9SubitizarProps) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Quantity[]>(() => shuffle(ALL_QUANTITIES));
  const [target, setTarget] = useState<Quantity>(() => pickRandom(ALL_QUANTITIES));
  const [image, setImage] = useState<string>(() => pickRandom(OBJECT_IMAGES));
  const [busy, setBusy] = useState(false);
  const [shakeQty, setShakeQty] = useState<Quantity | null>(null);
  // Timers en vuelo: se limpian al desmontar para que una voz retrasada no
  // suene después de salir del nivel.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // La consigna de bienvenida ES la primera pregunta, igual que en N5/N7.
  const { celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n9", {
    locale,
    welcomeFile: QUESTION_FILE[target],
  });
  const { idle, resetIdle } = useIdleHint();

  const handleTapGroup = useCallback(
    (qty: Quantity, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;
      resetIdle();

      if (qty !== target) {
        // Solo se sacude: el error no se castiga y la consigna sigue en pie.
        setShakeQty(qty);
        timers.current.push(setTimeout(() => setShakeQty(null), SHAKE_MS));
        return;
      }

      setBusy(true);
      celebrate(event);
      playVoiceClip(locale, EXCLAIM_FILE[qty]);
      timers.current.push(
        setTimeout(() => {
          const next = pickRandomExcept(ALL_QUANTITIES, target);
          setOrder(shuffle(ALL_QUANTITIES));
          setImage(pickRandom(OBJECT_IMAGES));
          setTarget(next);
          playVoiceClip(locale, QUESTION_FILE[next]);
          setBusy(false);
        }, NEXT_QUESTION_DELAY_MS),
      );
    },
    [busy, target, locale, celebrate, resetIdle],
  );

  return (
    <GameShell
      levelId="n9"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      style={{ display: "flex", flexDirection: "column" }}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-sm)",
          // Vertical simétrico a propósito: con padding-top grande y bottom chico,
          // el centrado de flex deja el contenido visiblemente por debajo del
          // centro (es lo que hacía ver medio vacía la pantalla en N3).
          padding: "calc(max(env(safe-area-inset-top), 16px) + 56px) var(--space-sm)",
        }}
      >
        {order.map((qty) => {
          const isHinting = idle && !busy && qty === target;
          return (
            <motion.button
              key={qty}
              type="button"
              aria-label={t("a11y.quantityOf", { count: qty })}
              onPointerDown={(e) => handleTapGroup(qty, e)}
              animate={
                shakeQty === qty
                  ? { x: [0, -10, 10, -10, 10, 0] }
                  : isHinting
                    ? { scale: [1, 1.06, 1], x: 0 }
                    : { scale: 1, x: 0 }
              }
              transition={
                shakeQty === qty
                  ? { duration: SHAKE_MS / 1000 }
                  : isHinting
                    ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }
              }
              whileTap={{ scale: 0.93 }}
              style={{
                position: "relative",
                width: "30vw",
                maxWidth: 150,
                aspectRatio: "1",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.82)",
                border: "4px solid rgba(255,255,255,0.9)",
                boxShadow: "0 8px 16px rgba(60,40,120,0.18)",
                padding: 0,
              }}
            >
              {LAYOUT[qty].map((pos, i) => (
                <img
                  key={i}
                  src={image}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    transform: "translate(-50%, -50%)",
                    width: "42%",
                    height: "42%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 3px 5px rgba(60,40,120,0.22))",
                  }}
                />
              ))}
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}
