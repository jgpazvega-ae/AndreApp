import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { pickRandom, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";

interface ColorDef {
  id: string;
  hex: string;
}

const PALETTE: ColorDef[] = [
  { id: "orange", hex: "#FFB03B" },
  { id: "indigo", hex: "#7C6FF0" },
  { id: "teal", hex: "#3DBBA0" },
];

const BACKGROUND = "linear-gradient(160deg, #E3FBF4 0%, #8FE0CB 100%)";
const ROUND_SIZE = 5;
const SHAKE_MS = 400;
const NEXT_ITEM_DELAY_MS = 500;
const ROUND_COMPLETE_DELAY_MS = 1600;

/** Reutiliza los elogios de proceso de N2; N4 es perceptual, no nombra el color (docs/CURRICULUM.md ficha N4). */
const ROUND_COMPLETE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

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
 * Versión **perceptual** (sin nombrar el color, precede a la clasificación
 * nombrada que depende del vocabulario de N5): toca la zona del color que
 * coincide con el objeto mostrado. Sin drag (alternativa tocar-tocar,
 * docs/CURRICULUM.md §2/§9). Zona incorrecta → el objeto se sacude, sin
 * sonido negativo; nunca cambia de intento hasta acertar.
 */
export function N4ClasificarPorAtributo({ locale, onExit }: N4ClasificarPorAtributoProps) {
  const { t } = useTranslation();
  const [zoneColors, setZoneColors] = useState<[ColorDef, ColorDef]>(() => pickRoundColors());
  const [itemColor, setItemColor] = useState<ColorDef>(() => pickRandom(zoneColors));
  const [sortedCount, setSortedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { celebrate, celebrateSignal, confettiField } = useGameSession("n4", { locale, welcomeFile: "n4-welcome.mp3" });
  const zoneColorsRef = useRef(zoneColors);
  zoneColorsRef.current = zoneColors;

  const handleTapZone = useCallback(
    (zoneColor: ColorDef, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy) return;

      if (zoneColor.id !== itemColor.id) {
        // Solo se sacude: el intento sigue en pie hasta acertar.
        setShaking(true);
        setTimeout(() => setShaking(false), SHAKE_MS);
        return;
      }

      setBusy(true);
      celebrate(event);
      const newCount = sortedCount + 1;

      if (newCount >= ROUND_SIZE) {
        setTimeout(() => playVoiceClip(locale, pickRandom(ROUND_COMPLETE_FILES)), 150);
        setTimeout(() => {
          const colors = pickRoundColors();
          setZoneColors(colors);
          setSortedCount(0);
          setItemColor(pickRandom(colors));
          setBusy(false);
        }, ROUND_COMPLETE_DELAY_MS);
      } else {
        setSortedCount(newCount);
        setTimeout(() => {
          setItemColor(pickRandom(zoneColorsRef.current));
          setBusy(false);
        }, NEXT_ITEM_DELAY_MS);
      }
    },
    [busy, itemColor, sortedCount, locale, celebrate],
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
    >
      <div style={{ flex: "0 0 42%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          key={itemColor.id + sortedCount}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={
            shaking ? { x: [0, -10, 10, -10, 10, 0], scale: 1, opacity: 1 } : { scale: [1, 1.06, 1], opacity: 1 }
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
