import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS, getLevelsByStage, type Stage } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";

const STAGES: Stage[] = ["A", "B", "C", "D"];

interface HomeScreenProps {
  onPlay: (levelId: string) => void;
  onOpenParentZone: () => void;
}

export function HomeScreen({ onPlay, onOpenParentZone }: HomeScreenProps) {
  const { t } = useTranslation();

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
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-md)",
        }}
      >
        <span style={{ fontSize: "1.3rem", fontWeight: 800 }}>{t("home.title")}</span>
        {/* Zona de padres: candado por mantener-pulsado, ver PLAN.md §2 */}
        <ParentZoneUnlockButton onOpen={onOpenParentZone} />
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", padding: "0 var(--space-md)" }}>
        {STAGES.map((stage) => {
          const levels = getLevelsByStage(stage);
          if (levels.length === 0) return null;
          return (
            <section key={stage}>
              <h2 style={{ fontSize: "1rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-sm)" }}>
                {t(`home.stage.${stage}`)}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                  gap: "var(--space-sm)",
                }}
              >
                {levels.map((level) => (
                  <BigButton
                    key={level.id}
                    icon={level.status === "playable" ? level.icon : level.free ? "⏳" : "🔒"}
                    label={t(level.titleKey)}
                    variant={level.status === "playable" ? "primary" : "locked"}
                    disabled={level.status !== "playable"}
                    onTap={() => onPlay(level.id)}
                  />
                ))}
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
        background: "var(--color-bg-elevated)",
        boxShadow: "var(--shadow-soft)",
        fontSize: "1.1rem",
      }}
    >
      ⚙️
    </button>
  );
}
