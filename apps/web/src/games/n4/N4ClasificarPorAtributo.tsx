import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playVoiceClip } from "../../audio/audioEngine";
import { useConfetti } from "../../effects/useConfetti";
import { useProgressStore } from "../../store/progressStore";

interface ColorDef {
  id: string;
  hex: string;
}

const PALETTE: ColorDef[] = [
  { id: "orange", hex: "#FFB03B" },
  { id: "indigo", hex: "#7C6FF0" },
  { id: "teal", hex: "#3DBBA0" },
];

const ROUND_SIZE = 5;
const SHAKE_MS = 400;
const NEXT_ITEM_DELAY_MS = 500;
const ROUND_COMPLETE_DELAY_MS = 1600;

/** Reutiliza los elogios de proceso de N2; N4 es perceptual, no nombra el color (docs/CURRICULUM.md ficha N4). */
const ROUND_COMPLETE_FILES = ["n2-praise-1.mp3", "n2-praise-2.mp3", "n2-praise-3.mp3", "n2-praise-4.mp3"];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickRoundColors(): [ColorDef, ColorDef] {
  const [a, b] = shuffle(PALETTE);
  return [a!, b!];
}

function pickOne<T>([a, b]: [T, T]): T {
  return Math.random() < 0.5 ? a : b;
}

interface N4ClasificarPorAtributoProps {
  locale: string;
  onExit: () => void;
}

/**
 * N4 · Clasificar por 1 atributo (docs/CURRICULUM.md ficha N4).
 * Versión **perceptual** (sin nombrar el color, precede a la clasificación
 * nombrada que depende del vocabulario de N5): toca la zona del color que
 * coincide con el objeto mostrado. Sin drag (alternativa tocar-tocar,
 * docs/CURRICULUM.md §2/§9). Zona incorrecta → el objeto se sacude, sin
 * sonido negativo; nunca cambia de intento hasta acertar.
 */
export function N4ClasificarPorAtributo({ locale, onExit }: N4ClasificarPorAtributoProps) {
  const [zoneColors, setZoneColors] = useState<[ColorDef, ColorDef]>(() => pickRoundColors());
  const [itemColor, setItemColor] = useState<ColorDef>(() => pickOne(zoneColors));
  const [sortedCount, setSortedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const recordPlay = useProgressStore((state) => state.recordPlay);
  const { burst, confettiField } = useConfetti();
  const zoneColorsRef = useRef(zoneColors);
  zoneColorsRef.current = zoneColors;

  useEffect(() => {
    recordPlay("n4");
    const t = setTimeout(() => playVoiceClip(locale, "n4-welcome.mp3"), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextItem = useCallback((colors: [ColorDef, ColorDef]) => {
    setItemColor(pickOne(colors));
  }, []);

  const handleTapZone = useCallback(
    (zoneColor: ColorDef, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (zoneColor.id === itemColor.id) {
        setBusy(true);
        playChime();
        burst(event.clientX, event.clientY);
        const newCount = sortedCount + 1;

        if (newCount >= ROUND_SIZE) {
          setTimeout(() => playVoiceClip(locale, ROUND_COMPLETE_FILES[Math.floor(Math.random() * ROUND_COMPLETE_FILES.length)]!), 150);
          setTimeout(() => {
            const colors = pickRoundColors();
            setZoneColors(colors);
            setSortedCount(0);
            nextItem(colors);
            setBusy(false);
          }, ROUND_COMPLETE_DELAY_MS);
        } else {
          setSortedCount(newCount);
          setTimeout(() => {
            nextItem(zoneColorsRef.current);
            setBusy(false);
          }, NEXT_ITEM_DELAY_MS);
        }
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), SHAKE_MS);
      }
    },
    [busy, itemColor, sortedCount, locale, burst, nextItem],
  );

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: "100vh",
        overflow: "hidden",
        background: "linear-gradient(160deg, #E3FBF4 0%, #8FE0CB 100%)",
        touchAction: "manipulation",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        type="button"
        aria-label="Regresar"
        onClick={onExit}
        style={{
          position: "absolute",
          top: "max(env(safe-area-inset-top), 16px)",
          left: 16,
          zIndex: 10,
          width: 48,
          height: 48,
          borderRadius: "var(--radius-pill)",
          background: "rgba(255,255,255,0.85)",
          fontSize: "1.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⬅️
      </button>

      {confettiField}

      <div style={{ flex: "0 0 42%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          key={itemColor.id + sortedCount}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={
            shaking
              ? { x: [0, -10, 10, -10, 10, 0], scale: 1, opacity: 1 }
              : { scale: [1, 1.06, 1], opacity: 1 }
          }
          transition={
            shaking
              ? { duration: SHAKE_MS / 1000 }
              : { scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.3 } }
          }
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: itemColor.hex,
            boxShadow: "0 12px 20px rgba(0,0,0,0.18)",
            border: "4px solid rgba(255,255,255,0.6)",
          }}
        />
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        {zoneColors.map((zone) => (
          <button
            key={zone.id}
            type="button"
            aria-label="Zona de color"
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
    </div>
  );
}
