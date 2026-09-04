import { motion, type PanInfo } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { findDropTarget } from "../../utils/dropTarget";
import { pickRandom, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";

interface ColorDef {
  id: string;
  hex: string;
  /** "¿Dónde está el naranja?" — dispara la fase nombrada al iniciar el intento. */
  voiceQuestion: string;
  /** "¡Naranja!" — confirma el nombre justo al acertar en fase nombrada. */
  voiceExclaim: string;
}

const PALETTE: ColorDef[] = [
  { id: "orange", hex: "#FFB03B", voiceQuestion: "n4-color-orange.mp3", voiceExclaim: "n4-exclaim-orange.mp3" },
  { id: "indigo", hex: "#7C6FF0", voiceQuestion: "n4-color-indigo.mp3", voiceExclaim: "n4-exclaim-indigo.mp3" },
  { id: "teal", hex: "#3DBBA0", voiceQuestion: "n4-color-teal.mp3", voiceExclaim: "n4-exclaim-teal.mp3" },
];

const BACKGROUND = "linear-gradient(160deg, #E3FBF4 0%, #8FE0CB 100%)";
const ROUND_SIZE = 5;
const SHAKE_MS = 400;
const NEXT_ITEM_DELAY_MS = 500;
const ROUND_COMPLETE_DELAY_MS = 1600;
/** Aciertos perceptuales antes de que pueda aparecer un intento nombrado (docs/CURRICULUM.md ficha N4). */
const NAMED_UNLOCK_THRESHOLD = 5;
/** A partir del desbloqueo, la mitad de los intentos son nombrados y la mitad perceptuales
 * ("repetición con variación", docs/CURRICULUM.md §6): no se abandona la fase más fácil de golpe. */
const NAMED_TRIAL_CHANCE = 0.5;

function pickRoundColors(): [ColorDef, ColorDef] {
  const [a, b] = shuffle(PALETTE);
  return [a!, b!];
}

interface N4ClasificarPorAtributoProps {
  locale: string;
  onExit: () => void;
}

/**
 * N4 · Clasificar por 1 atributo (docs/CURRICULUM.md ficha N4).
 * Toca la zona del color que coincide con el objetivo. Empieza en fase
 * **perceptual** (se muestra una bolita del color a buscar); tras
 * NAMED_UNLOCK_THRESHOLD aciertos, algunos intentos pasan a fase
 * **nombrada**: la bolita se oculta, una voz pregunta "¿Dónde está el
 * [color]?" y el niño debe reconocer el nombre, no solo emparejar visualmente
 * (la clasificación nombrada de la ficha). Ambas fases se alternan al azar,
 * nunca se abandona la perceptual por completo. Sin drag obligatorio
 * (alternativa tocar-tocar, docs/CURRICULUM.md §2/§9). Zona incorrecta → el
 * objetivo se sacude, sin sonido negativo; nunca cambia de intento hasta
 * acertar.
 */
export function N4ClasificarPorAtributo({ locale, onExit }: N4ClasificarPorAtributoProps) {
  const { t } = useTranslation();
  const [zoneColors, setZoneColors] = useState<[ColorDef, ColorDef]>(() => pickRoundColors());
  const [itemColor, setItemColor] = useState<ColorDef>(() => pickRandom(zoneColors));
  const [mode, setMode] = useState<"perceptual" | "named">("perceptual");
  const [sortedCount, setSortedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { celebrate, encourage, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession("n4", {
    locale,
    welcomeFile: "n4-welcome.mp3",
  });
  const zoneColorsRef = useRef(zoneColors);
  zoneColorsRef.current = zoneColors;
  // Total de aciertos en la sesión (no se reinicia entre rondas): decide cuándo
  // puede aparecer la fase nombrada. Vive en un ref porque solo se lee dentro
  // de callbacks, nunca directamente en el render.
  const totalCorrectRef = useRef(0);
  // Posiciones de las zonas en pantalla, para saber sobre cuál se soltó la bolita arrastrada.
  const zoneRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  /** Arranca un intento nuevo: elige el color objetivo y, si toca fase nombrada,
   * hace la pregunta hablada (docs/CURRICULUM.md ficha N4). */
  const startTrial = useCallback(
    (colors: [ColorDef, ColorDef]) => {
      const canBeNamed = totalCorrectRef.current >= NAMED_UNLOCK_THRESHOLD;
      const nextMode = canBeNamed && Math.random() < NAMED_TRIAL_CHANCE ? "named" : "perceptual";
      const nextColor = pickRandom(colors);
      setMode(nextMode);
      setItemColor(nextColor);
      if (nextMode === "named") playVoiceClip(locale, nextColor.voiceQuestion);
    },
    [locale],
  );

  const handleTapZone = useCallback(
    (zoneColor: ColorDef, point: { clientX: number; clientY: number }) => {
      if (busy) return;

      if (zoneColor.id !== itemColor.id) {
        // Se sacude Y se anima a seguir intentando: el intento sigue en pie.
        encourage();
        setShaking(true);
        setTimeout(() => setShaking(false), SHAKE_MS);
        return;
      }

      setBusy(true);
      celebrate(point);
      totalCorrectRef.current += 1;
      // En fase nombrada, confirma el nombre del color justo al acertar (igual patrón que N7).
      if (mode === "named") playVoiceClip(locale, itemColor.voiceExclaim);
      const newCount = sortedCount + 1;

      if (newCount >= ROUND_SIZE) {
        // El festejo de ronda completa (3 estrellas + elogio) ya lo da
        // LevelCompleteOverlay solo: aquí solo se prepara el tablero para
        // cuando el niño cierre la pantalla de logro, sin voz duplicada.
        setTimeout(() => {
          const colors = pickRoundColors();
          setZoneColors(colors);
          setSortedCount(0);
          // Primer intento de cada ronda siempre perceptual: nombrar un color
          // mientras el tablero nuevo está tapado por la pantalla de logro
          // dejaría la pregunta hablada sin nada que el niño pueda responder todavía.
          setMode("perceptual");
          setItemColor(pickRandom(colors));
          setBusy(false);
        }, ROUND_COMPLETE_DELAY_MS);
      } else {
        setSortedCount(newCount);
        setTimeout(() => {
          startTrial(zoneColorsRef.current);
          setBusy(false);
        }, NEXT_ITEM_DELAY_MS);
      }
    },
    [busy, itemColor, sortedCount, mode, locale, celebrate, encourage, startTrial],
  );

  /** Arrastre real de la bolita: al soltar, se busca la zona bajo el dedo y se
   * resuelve exactamente igual que un toque directo sobre la zona. */
  const handleItemDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const target = findDropTarget(info.point, zoneRefs.current);
      const zone = zoneColorsRef.current.find((z) => z.id === target);
      if (zone) handleTapZone(zone, { clientX: info.point.x, clientY: info.point.y });
    },
    [handleTapZone],
  );

  return (
    <GameShell
      levelId="n4"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      decor={false}
      style={{ display: "flex", flexDirection: "column" }}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
    >
      <div style={{ flex: "0 0 42%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {mode === "perceptual" ? (
          <motion.div
            key={itemColor.id + sortedCount}
            drag
            dragSnapToOrigin
            dragElastic={0.15}
            dragMomentum={false}
            onDragEnd={handleItemDragEnd}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              shaking ? { x: [0, -10, 10, -10, 10, 0], scale: 1, opacity: 1 } : { scale: [1, 1.06, 1], opacity: 1 }
            }
            whileDrag={{ scale: 1.15 }}
            transition={
              shaking
                ? { duration: SHAKE_MS / 1000 }
                : { scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.3 } }
            }
            style={{
              position: "relative",
              zIndex: 5,
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: itemColor.hex,
              boxShadow: "0 12px 20px rgba(0,0,0,0.18)",
              border: "4px solid rgba(255,255,255,0.6)",
              touchAction: "none",
            }}
          />
        ) : (
          // Fase nombrada: sin bolita (mostrarla delataría la respuesta). El
          // altavoz es tocable para repetir la pregunta cuantas veces haga falta.
          <motion.button
            key={"named-" + itemColor.id + sortedCount}
            type="button"
            aria-label={t("a11y.replayQuestion")}
            onClick={() => playVoiceClip(locale, itemColor.voiceQuestion)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              shaking ? { x: [0, -10, 10, -10, 10, 0], scale: 1, opacity: 1 } : { scale: [1, 1.08, 1], opacity: 1 }
            }
            whileTap={{ scale: 0.9 }}
            transition={
              shaking
                ? { duration: SHAKE_MS / 1000 }
                : { scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.3 } }
            }
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "linear-gradient(160deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
              border: "4px dashed rgba(255,255,255,0.9)",
              boxShadow: "0 12px 20px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.6rem",
              lineHeight: 1,
            }}
          >
            🔊
          </motion.button>
        )}
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        {zoneColors.map((zone) => (
          <button
            key={zone.id}
            ref={(el) => {
              zoneRefs.current.set(zone.id, el);
            }}
            type="button"
            aria-label={t("a11y.colorZone")}
            onPointerDown={(e) => handleTapZone(zone, e)}
            style={{
              flex: 1,
              background: zone.hex,
              border: "none",
              borderTop: "6px solid rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </GameShell>
  );
}
