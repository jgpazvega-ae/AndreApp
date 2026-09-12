import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS, type WorldId } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";
import { HubHeader, type HubHeaderIcon } from "../components/HubHeader";
import { WORLDS } from "../data/worlds";

interface AprenderScreenProps {
  onOpenWorld: (worldId: WorldId) => void;
  onBack: () => void;
}

/** Mismo gradiente que el tile "Aprender" de Home (§PILLARS): índigo, para
 * distinguirlo de un mundo específico (naranja/verde/azul). */
const APRENDER_GRADIENT: [string, string] = ["#8B7FF5", "#4F46E5"];
const HERO_ICONS: HubHeaderIcon[] = [
  { icon: "🧩", left: "42%", top: "60%", size: "1.4rem", duration: 3.4 },
  { icon: "✏️", left: "78%", top: "18%", size: "1.2rem", duration: 2.8 },
  { icon: "🔤", left: "90%", top: "55%", size: "1.3rem", duration: 3.6 },
];

/**
 * Pilar Aprender (Product Vision §2): el mapa de mundos que antes vivía
 * directo en HomeScreen. Se mudó de lugar, no de forma — mismo BigButton,
 * mismos 3 mundos, mismo WorldScreen detrás — para no arriesgar nada de lo
 * que ya funcionaba (Product Vision §28: "no reescribir innecesariamente").
 */
export function AprenderScreen({ onOpenWorld, onBack }: AprenderScreenProps) {
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
      <HubHeader title={t("aprender.title")} onBack={onBack} gradient={APRENDER_GRADIENT} icons={HERO_ICONS} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "var(--space-md)",
          padding: "var(--space-lg) var(--space-md) 0",
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
        {t("home.levelsReady", {
          done: CURRICULUM_LEVELS.filter((l) => l.status === "playable").length,
          total: CURRICULUM_LEVELS.length,
        })}
      </footer>
    </div>
  );
}
