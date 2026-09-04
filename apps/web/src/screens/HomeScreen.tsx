import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS, getLevelsByStage, type Stage } from "@andreapp/curriculum";
import { APP_NAME } from "@andreapp/shared";
import { playChime } from "../audio/audioEngine";
import { BigButton } from "../components/BigButton";
import { useProgressStore } from "../store/progressStore";
import { asset } from "../utils/asset";

/** Cuánto queda visible el avisito de "muy pronto" tras tocar un nivel aún no construido. */
const COMING_SOON_TOAST_MS = 1800;

const STAGES: Stage[] = ["A", "B", "C", "D"];

/** Los 3 perritos de la familia, como amigos que saludan en la pantalla de inicio. */
const FRIEND_FILES = ["illustrations/friend-1.png", "illustrations/friend-2.png", "illustrations/friend-3.png"];

const STAGE_GRADIENT: Record<Stage, [string, string]> = {
  A: ["#FFC46B", "#E0912A"],
  B: ["#6BD6C2", "#2E9C89"],
  C: ["#8B7FF5", "#5B4FE0"],
  D: ["#F58BC0", "#D94F94"],
};

const STAGE_BADGE: Record<Stage, string> = { A: "🌟", B: "🧭", C: "🧠", D: "🎓" };

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
  onPlay: (levelId: string) => void;
  onOpenParentZone: () => void;
}

export function HomeScreen({ onPlay, onOpenParentZone }: HomeScreenProps) {
  const { t } = useTranslation();
  const levelsProgress = useProgressStore((state) => state.levels);
  let tileIndex = 0;

  // Tocar un nivel "muy pronto" no debe sentirse como un botón roto: en vez de
  // no hacer nada (un <button disabled> nativo ni siquiera reacciona al
  // toque), suena y muestra un avisito breve — sin fingir que el nivel existe.
  const [showComingSoon, setShowComingSoon] = useState(false);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLockedTap = () => {
    playChime();
    setShowComingSoon(true);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setShowComingSoon(false), COMING_SOON_TOAST_MS);
  };
  useEffect(
    () => () => {
      if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    },
    [],
  );

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
          {FRIEND_FILES.map((file, i) => (
            <FriendAvatar key={file} file={file} delayIndex={i} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", padding: "0 var(--space-md)" }}>
        {STAGES.map((stage) => {
          const levels = getLevelsByStage(stage);
          if (levels.length === 0) return null;
          const [from, to] = STAGE_GRADIENT[stage];
          return (
            <section key={stage}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px 4px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: `linear-gradient(90deg, ${from}, ${to})`,
                  marginBottom: "var(--space-sm)",
                }}
              >
                <span aria-hidden="true">{STAGE_BADGE[stage]}</span>
                <h2
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    color: "#fff",
                    margin: 0,
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  }}
                >
                  {t(`home.stage.${stage}`)}
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                  gap: "var(--space-sm)",
                }}
              >
                {levels.map((level) => {
                  const isPlayable = level.status === "playable";
                  const idx = tileIndex++;
                  return (
                    <BigButton
                      key={level.id}
                      icon={isPlayable ? level.icon : level.free ? "⏳" : "🔒"}
                      label={t(level.titleKey)}
                      gradient={STAGE_GRADIENT[stage]}
                      locked={!isPlayable}
                      disabled={!isPlayable}
                      delayIndex={idx}
                      roundsCompleted={levelsProgress[level.id]?.roundsCompleted ?? 0}
                      onTap={() => onPlay(level.id)}
                      onLockedTap={handleLockedTap}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
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

      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            key="coming-soon-toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            style={{
              position: "fixed",
              left: "50%",
              bottom: "max(env(safe-area-inset-bottom), 20px)",
              transform: "translateX(-50%)",
              zIndex: 30,
              background: "var(--color-text)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "var(--radius-pill)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: "0.9rem",
              boxShadow: "var(--shadow-soft)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden="true">🚧</span>
            {t("common.comingSoon")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Amiguito perruno tocable: hace una respiración suave y salta al tocarlo (sin sonido, es decorativo). */
function FriendAvatar({ file, delayIndex }: { file: string; delayIndex: number }) {
  const { t } = useTranslation();
  const [tapCount, setTapCount] = useState(0);
  const [cheering, setCheering] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setCheering(true);
    const timeout = window.setTimeout(() => setCheering(false), 700);
    return () => window.clearTimeout(timeout);
  }, [tapCount]);

  return (
    <motion.button
      type="button"
      aria-label={t("a11y.friend")}
      onPointerDown={() => setTapCount((c) => c + 1)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + delayIndex * 0.08, ease: "easeOut" }}
      style={{ background: "none", border: "none", padding: 0, width: 56 }}
    >
      <motion.img
        src={asset(file)}
        alt=""
        aria-hidden="true"
        animate={cheering ? { y: [0, -16, 0], rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : { y: [0, -3, 0] }}
        transition={
          cheering ? { duration: 0.7, ease: "easeInOut" } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
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
