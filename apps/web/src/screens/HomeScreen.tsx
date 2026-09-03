import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS, getLevelsByStage, type Stage } from "@andreapp/curriculum";
import { APP_NAME } from "@andreapp/shared";
import { BigButton } from "../components/BigButton";
import { asset } from "../utils/asset";

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

interface HomeScreenProps {
  onPlay: (levelId: string) => void;
  onOpenParentZone: () => void;
}

export function HomeScreen({ onPlay, onOpenParentZone }: HomeScreenProps) {
  const { t } = useTranslation();
  let tileIndex = 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--color-bg)", paddingBottom: "var(--space-xl)" }}>
      {/* Hero: fondo ilustrado + mascota + saludo */}
      <div style={{ position: "relative", overflow: "hidden", paddingBottom: "var(--space-lg)" }}>
        <img
          src={asset("illustrations/background.webp")}
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,247,237,0.15) 0%, rgba(255,247,237,0.55) 65%, var(--color-bg) 100%)",
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
            <div style={{ fontSize: "1.4rem", fontWeight: 800, textShadow: "0 2px 8px rgba(255,255,255,0.6)" }}>{t("home.title")}</div>
          </div>
          <ParentZoneUnlockButton onOpen={onOpenParentZone} />
        </header>

        <motion.img
          src={asset("illustrations/mascot.png")}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "relative",
            zIndex: 1,
            display: "block",
            margin: "0 auto",
            width: "min(38vw, 168px)",
            filter: "drop-shadow(0 12px 16px rgba(120,60,10,0.22))",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", gap: "var(--space-sm)", marginTop: -4 }}>
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
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", margin: 0, textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
                  {t(`home.stage.${stage}`)}
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "var(--space-sm)" }}>
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
                      onTap={() => onPlay(level.id)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <footer style={{ padding: "var(--space-md)", color: "var(--color-text-muted)", fontSize: "0.75rem", textAlign: "center" }}>
        {CURRICULUM_LEVELS.filter((l) => l.status === "playable").length} / {CURRICULUM_LEVELS.length} niveles listos
      </footer>
    </div>
  );
}

/** Amiguito perruno tocable: hace una respiración suave y salta al tocarlo (sin sonido, es decorativo). */
function FriendAvatar({ file, delayIndex }: { file: string; delayIndex: number }) {
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
      aria-label="Amigo"
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
        transition={cheering ? { duration: 0.7, ease: "easeInOut" } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "auto", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.18))" }}
      />
    </motion.button>
  );
}

const PARENT_ZONE_HOLD_MS = 3000;

function ParentZoneUnlockButton({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const start = () => {
    timer = setTimeout(onOpen, PARENT_ZONE_HOLD_MS);
  };
  const cancel = () => {
    if (timer) clearTimeout(timer);
  };

  return (
    <button
      type="button"
      aria-label={t("parentZone.title")}
      title={t("parentZone.unlockHint")}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      style={{
        width: 44,
        height: 44,
        borderRadius: "var(--radius-pill)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(4px)",
        boxShadow: "var(--shadow-soft)",
        fontSize: "1.1rem",
      }}
    >
      ⚙️
    </button>
  );
}
