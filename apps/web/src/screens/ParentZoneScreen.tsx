import { useTranslation } from "react-i18next";
import { getLevel } from "@andreapp/curriculum";
import { SUPPORTED_LOCALES, type AppLocale } from "@andreapp/shared";
import { JUGAR_GAMES } from "../data/jugarGames";
import { useProgressStore } from "../store/progressStore";

/** Título de cualquier id jugado: nivel del currículo o juego de la biblioteca de Jugar. */
function titleKeyFor(levelId: string): string | undefined {
  return getLevel(levelId)?.titleKey ?? JUGAR_GAMES.find((game) => game.id === levelId)?.titleKey;
}

interface ParentZoneScreenProps {
  onClose: () => void;
}

const LOCALE_LABEL: Record<AppLocale, string> = {
  "es-MX": "Español 🇲🇽",
  en: "English 🇺🇸",
  "pt-BR": "Português 🇧🇷",
};

/** Puntos de color para el resumen de habilidades (Product Vision §14): solo
 * distinguen una etiqueta de otra a golpe de vista, no codifican un sistema. */
const SKILL_DOTS = ["🟢", "🟡", "🔵", "🟣"];

/**
 * Zona de padres mínima de Fase 0: idioma y progreso básico.
 * La compra/licencia (link de PayPal + código) llega en Fase 3 (PLAN.md §10).
 */
export function ParentZoneScreen({ onClose }: ParentZoneScreenProps) {
  const { t, i18n } = useTranslation();
  const { locale, setLocale, levels, sensoryMode, setSensoryMode } = useProgressStore();

  const handleLocaleChange = (next: AppLocale) => {
    setLocale(next);
    void i18n.changeLanguage(next);
  };

  const calmMode = sensoryMode === "calm";
  const playedLevels = Object.values(levels);

  // Resumen no evaluativo (Product Vision §14): habilidades que tocó HOY,
  // no una lista de aciertos/errores. `lastPlayedAt` ya se registra por
  // sesión (useGameSession); solo hace falta agrupar por skill del día.
  const todayKey = new Date().toDateString();
  const playedToday = playedLevels.filter(
    (p) => p.lastPlayedAt && new Date(p.lastPlayedAt).toDateString() === todayKey,
  );
  const skillsToday = Array.from(new Set(playedToday.flatMap((p) => getLevel(p.levelId)?.skills ?? [])));

  return (
    <div style={{ flex: 1, padding: "var(--space-md)", background: "var(--color-bg)" }}>
      <button
        type="button"
        onClick={onClose}
        style={{ marginBottom: "var(--space-md)", background: "none", color: "var(--color-accent)", fontWeight: 700 }}
      >
        ← {t("common.close")}
      </button>

      <h1 style={{ fontSize: "1.4rem" }}>{t("parentZone.title")}</h1>

      <section style={{ marginTop: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.language")}</h2>
        <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => handleLocaleChange(l)}
              style={{
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                background: l === locale ? "var(--color-accent)" : "var(--color-bg-elevated)",
                color: l === locale ? "#fff" : "var(--color-text)",
                boxShadow: "var(--shadow-soft)",
                fontWeight: 700,
              }}
            >
              {LOCALE_LABEL[l]}
            </button>
          ))}
        </div>
        {/* Honesto en vez de silencioso: hoy solo existen voces en español
            (roadmap Fase 2, PLAN.md). Sin este aviso, un padre que elige otro
            idioma no tiene forma de saber por qué el niño deja de escuchar
            las consignas — se sentiría como una app rota, no como un idioma
            todavía sin voces. */}
        {locale !== "es-MX" && (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "var(--space-sm)" }}>
            {t("parentZone.voicesSpanishOnly")}
          </p>
        )}
      </section>

      <section style={{ marginTop: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.calmMode")}</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", margin: "4px 0 var(--space-sm)" }}>
          {t("parentZone.calmModeHint")}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={calmMode}
          onClick={() => setSensoryMode(calmMode ? "normal" : "calm")}
          style={{
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-md)",
            background: calmMode ? "var(--color-accent)" : "var(--color-bg-elevated)",
            color: calmMode ? "#fff" : "var(--color-text)",
            boxShadow: "var(--shadow-soft)",
            fontWeight: 700,
          }}
        >
          {calmMode ? t("parentZone.calmModeOn") : t("parentZone.calmModeOff")}
        </button>
      </section>

      <section style={{ marginTop: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.today")}</h2>
        {skillsToday.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{t("parentZone.todayNone")}</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
            {skillsToday.map((skill, i) => (
              <span
                key={skill}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--color-bg-elevated)",
                  boxShadow: "var(--shadow-soft)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <span aria-hidden="true">{SKILL_DOTS[i % SKILL_DOTS.length]}</span>
                {t(`skill.${skill}`)}
              </span>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.progress")}</h2>
        {playedLevels.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>{t("parentZone.noActivity")}</p>
        ) : (
          <ul>
            {playedLevels.map((p) => {
              // Nombre del nivel, no su id: "Causa y efecto — 3 veces" le dice
              // algo a un papá; "n1 — 3 veces" no.
              const titleKey = titleKeyFor(p.levelId);
              return (
                <li key={p.levelId}>
                  {titleKey ? t(titleKey) : p.levelId} — {t("parentZone.timesPlayed", { count: p.timesPlayed })}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.about")}</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          {t("app.name")} — v0.1.0. {t("parentZone.aboutBody")}
        </p>
      </section>
    </div>
  );
}
