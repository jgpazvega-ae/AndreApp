import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS, type WorldId } from "@andreapp/curriculum";
import { APP_NAME } from "@andreapp/shared";
import { playSound } from "../audio/audioEngine";
import { BigButton } from "../components/BigButton";
import { BUDDIES } from "../data/buddies";
import { WORLDS } from "../data/worlds";
import { useProgressStore } from "../store/progressStore";
import { asset } from "../utils/asset";

/** Chispas flotantes del hero: mismo lenguaje visual que AudioUnlockGate, para que
 * la primera pantalla que el niño ve después de desbloquear el audio se sienta
 * como continuación de la misma escena mágica, no como un cambio de app. */
const HERO_SPARKLES = [
  { left: "10%", top: "10%", size: "1.3rem" },
  { left: "84%", top: "16%", size: "1rem" },
  { left: "18%", top: "58%", size: "0.9rem" },
  { left: "88%", top: "52%", size: "1.2rem" },
];

interface HomeScreenProps {
  onOpenWorld: (worldId: WorldId) => void;
  onOpenParentZone: () => void;
}

export function HomeScreen({ onOpenWorld, onOpenParentZone }: HomeScreenProps) {
  const { t } = useTranslation();
  const selectedBuddy = useProgressStore((state) => state.selectedBuddy);
  const setSelectedBuddy = useProgressStore((state) => state.setSelectedBuddy);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        paddingBottom: "var(--space-xl)",
      }}
    >
      {/* Hero: fondo ilustrado + mascota + saludo */}
      <div style={{ position: "relative", overflow: "hidden", paddingBottom: "var(--space-lg)" }}>
        <img
          src={asset("illustrations/background.webp")}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,247,237,0.15) 0%, rgba(255,247,237,0.55) 65%, var(--color-bg) 100%)",
          }}
        />

        <header
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "max(env(safe-area-inset-top), var(--space-md)) var(--space-md) 0",
          }}
        >
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)" }}>{APP_NAME}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, textShadow: "0 2px 8px rgba(255,255,255,0.6)" }}>
              {t("home.title")}
            </div>
          </div>
          <ParentZoneUnlockButton onOpen={onOpenParentZone} />
        </header>

        {HERO_SPARKLES.map((pos, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: pos.left,
              top: pos.top,
              fontSize: pos.size,
              zIndex: 1,
              pointerEvents: "none",
            }}
            animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            ✨
          </motion.span>
        ))}

        {/* Entrada (una vez) e idle (en bucle) son dos motion separados a propósito:
            mezclarlos en un solo `animate` hace que la entrada "espere" al primer
            keyframe del bucle en vez de aparecer rápido. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <motion.img
            src={asset("illustrations/mascot.png")}
            alt=""
            aria-hidden="true"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{
              display: "block",
              margin: "0 auto",
              width: "min(38vw, 168px)",
              filter: "drop-shadow(0 12px 16px rgba(120,60,10,0.22))",
            }}
          />
        </motion.div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-sm)",
            marginTop: -4,
          }}
        >
          {BUDDIES.map((buddy, i) => (
            <BuddyAvatar
              key={buddy.id}
              buddy={buddy}
              delayIndex={i}
              selected={selectedBuddy === buddy.id}
              onSelect={() => setSelectedBuddy(buddy.id)}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "var(--space-md)",
          padding: "0 var(--space-md)",
        }}
      >
        {WORLDS.map((world, i) => (
          <BigButton
            key={world.id}
            icon={world.icon}
            label={t(world.nameKey)}
            gradient={world.gradient}
            delayIndex={i}
            onTap={() => onOpenWorld(world.id)}
          />
        ))}
      </div>

      <footer
        style={{
          padding: "var(--space-md)",
          color: "var(--color-text-muted)",
          fontSize: "0.75rem",
          textAlign: "center",
        }}
      >
        {CURRICULUM_LEVELS.filter((l) => l.status === "playable").length} / {CURRICULUM_LEVELS.length} niveles listos
      </footer>
    </div>
  );
}

/**
 * Amiguito perruno tocable: tocarlo lo ELIGE como compañero (se guarda en el
 * progreso y a partir de ahí acompaña al niño en todos los niveles, ver
 * GameBuddy) — a diferencia de antes, donde tocar solo hacía un saltito sin
 * ningún efecto real. Ladra con su propio sonido al elegirlo, y el elegido
 * queda con un anillo que lo distingue de los otros dos sin necesitar texto
 * (el niño no lee, docs/CURRICULUM.md §2).
 */
function BuddyAvatar({
  buddy,
  delayIndex,
  selected,
  onSelect,
}: {
  buddy: (typeof BUDDIES)[number];
  delayIndex: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const [cheering, setCheering] = useState(false);
  const mounted = useRef(false);

  const handleTap = () => {
    onSelect();
    playSound(buddy.barkSound);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setCheering(true);
    const timeout = window.setTimeout(() => setCheering(false), 700);
    return () => window.clearTimeout(timeout);
  }, [selected]);

  return (
    <motion.button
      type="button"
      aria-label={t("a11y.chooseBuddy", { name: t(buddy.nameKey) })}
      aria-pressed={selected}
      onPointerDown={handleTap}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + delayIndex * 0.08, ease: "easeOut" }}
      style={{
        background: "none",
        border: "none",
        padding: 6,
        width: 68,
        borderRadius: "var(--radius-pill)",
        boxShadow: selected ? "0 0 0 3px var(--color-accent)" : "none",
      }}
    >
      <motion.img
        src={buddy.image}
        alt=""
        aria-hidden="true"
        animate={
          cheering && selected ? { y: [0, -16, 0], rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : { y: [0, -3, 0] }
        }
        transition={
          cheering && selected
            ? { duration: 0.7, ease: "easeInOut" }
            : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ width: "100%", height: "auto", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.18))" }}
      />
    </motion.button>
  );
}

const PARENT_ZONE_HOLD_MS = 3000;

/**
 * Se entra manteniendo pulsado 3s: una barrera que un niño pequeño no cruza
 * por accidente. Dos bugs reales corregidos aquí:
 *
 * 1. Sin retroalimentación visual, mantener pulsado 3 segundos enteros sin
 *    que pase NADA en pantalla se lee como "no funciona" — un padre suelta
 *    antes de tiempo pensando que está roto. El anillo que se llena es la
 *    señal de "sigue, ya casi".
 * 2. `onPointerLeave` cancelaba el conteo con solo mover el dedo un par de
 *    píxeles dentro del propio botón (muy común en un botón chico de 44px
 *    en pantalla táctil real) — el mouse simulado de las pruebas e2e no
 *    tiembla, por eso ahí nunca se notó. `setPointerCapture` hace que el
 *    botón siga recibiendo el `pointerup` pase lo que pase con el dedo, así
 *    que ya no hace falta (ni conviene) cancelar por "salir" del botón.
 */
function ParentZoneUnlockButton({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setPressed(true);
    timerRef.current = setTimeout(() => {
      setPressed(false);
      onOpen();
    }, PARENT_ZONE_HOLD_MS);
  };
  const cancel = () => {
    setPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div style={{ position: "relative", width: 44, height: 44 }}>
      <svg width={44} height={44} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
        <motion.circle
          cx={22}
          cy={22}
          r={19}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          initial={false}
          animate={{ pathLength: pressed ? 1 : 0, opacity: pressed ? 1 : 0 }}
          transition={pressed ? { duration: PARENT_ZONE_HOLD_MS / 1000, ease: "linear" } : { duration: 0.15 }}
        />
      </svg>
      <motion.button
        type="button"
        aria-label={t("parentZone.title")}
        title={t("parentZone.unlockHint")}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        animate={{ scale: pressed ? 0.88 : 1 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-pill)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(4px)",
          boxShadow: "var(--shadow-soft)",
          fontSize: "1.1rem",
          touchAction: "none",
        }}
      >
        ⚙️
      </motion.button>
    </div>
  );
}
