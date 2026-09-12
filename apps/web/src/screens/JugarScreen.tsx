import { useTranslation } from "react-i18next";
import { CURRICULUM_LEVELS } from "@andreapp/curriculum";
import { BigButton } from "../components/BigButton";
import { FavoriteHeart } from "../components/FavoriteHeart";
import { HubHeader, type HubHeaderIcon } from "../components/HubHeader";
import { JUGAR_GAMES } from "../data/jugarGames";
import { getWorld } from "../data/worlds";
import { useProgressStore } from "../store/progressStore";

interface JugarScreenProps {
  onPlay: (levelId: string) => void;
  onBack: () => void;
}

/** Íconos del cielo del encabezado: ninguno pertenece a un juego en particular,
 * solo comunican "aquí vive la diversión" antes de que la mirada baje a la
 * cuadrícula. Mismo lenguaje que HERO_SPARKLES de HomeScreen, adaptado al
 * tema de Jugar en vez de genérico. */
const HERO_ICONS: HubHeaderIcon[] = [
  { icon: "🎈", left: "42%", top: "62%", size: "1.5rem", duration: 3.2 },
  { icon: "⭐", left: "76%", top: "16%", size: "1.2rem", duration: 2.6 },
  { icon: "🧸", left: "90%", top: "55%", size: "1.4rem", duration: 3.6 },
];

/**
 * Pilar Jugar (Product Vision §2, §17): todo lo jugable en una sola
 * cuadrícula, sin agrupar por mundo — para el niño que ya sabe qué quiere
 * jugar y no necesita pasar por el mapa curricular de Aprender.
 *
 * El encabezado con degradado (antes un simple header blanco) usa el mismo
 * lenguaje visual que WorldScreen: sin él, Jugar era la única sección
 * "plana" de la app — todas las demás (Home, un Mundo, un nivel) se sienten
 * como un lugar con color propio y esta se sentía como una lista de ajustes.
 */
export function JugarScreen({ onPlay, onBack }: JugarScreenProps) {
  const { t } = useTranslation();
  const levelsProgress = useProgressStore((state) => state.levels);
  const playable = CURRICULUM_LEVELS.filter((level) => level.status === "playable").sort((a, b) => a.order - b.order);

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
      <HubHeader title={t("hub.jugar")} onBack={onBack} gradient={["#FFB03B", "#E0912A"]} icons={HERO_ICONS} />

      {/* Biblioteca de Jugar: juegos autoexplicativos, sin orden ni "siguiente" — se
          abren, se juegan, se repiten. Van primero porque son el contenido que
          crece más rápido y el que el niño reconoce sin pasar por el currículo. */}
      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: 800,
          color: "var(--color-text-muted)",
          padding: "var(--space-lg) var(--space-md) 0",
        }}
      >
        {t("jugar.library.heading")}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "var(--space-sm)",
          padding: "var(--space-sm) var(--space-md) 0",
        }}
      >
        {JUGAR_GAMES.map((game, idx) => (
          <div key={game.id} style={{ position: "relative" }}>
            <FavoriteHeart id={game.id} />
            <BigButton
              icon={game.icon}
              label={t(game.titleKey)}
              gradient={game.gradient}
              delayIndex={idx}
              roundsCompleted={levelsProgress[game.id]?.roundsCompleted ?? 0}
              onTap={() => onPlay(game.id)}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: 800,
          color: "var(--color-text-muted)",
          padding: "var(--space-xl) var(--space-md) 0",
        }}
      >
        {t("jugar.curriculum.heading")}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "var(--space-sm)",
          padding: "var(--space-sm) var(--space-md) 0",
        }}
      >
        {playable.map((level, idx) => (
          <div key={level.id} style={{ position: "relative" }}>
            <FavoriteHeart id={level.id} />
            <BigButton
              icon={level.icon}
              label={t(level.titleKey)}
              gradient={getWorld(level.world ?? "estacion").gradient}
              delayIndex={idx + JUGAR_GAMES.length}
              roundsCompleted={levelsProgress[level.id]?.roundsCompleted ?? 0}
              onTap={() => onPlay(level.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
