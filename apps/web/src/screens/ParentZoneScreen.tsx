import { useTranslation } from "react-i18next";
import { getLevel } from "@andreapp/curriculum";
import { SUPPORTED_LOCALES, type AppLocale } from "@andreapp/shared";
import { useProgressStore } from "../store/progressStore";

interface ParentZoneScreenProps {
  onClose: () => void;
}

const LOCALE_LABEL: Record<AppLocale, string> = {
  "es-MX": "Español 🇲🇽",
  en: "English 🇺🇸",
  "pt-BR": "Português 🇧🇷",
};

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
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.progress")}</h2>
        {playedLevels.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>{t("parentZone.noActivity")}</p>
        ) : (
          <ul>
            {playedLevels.map((p) => {
              // Nombre del nivel, no su id: "Causa y efecto — 3 veces" le dice
              // algo a un papá; "n1 — 3 veces" no.
              const titleKey = getLevel(p.levelId)?.titleKey;
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
