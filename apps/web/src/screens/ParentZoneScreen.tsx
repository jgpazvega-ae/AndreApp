import { useTranslation } from "react-i18next";
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
  const { locale, setLocale, levels } = useProgressStore();

  const handleLocaleChange = (next: AppLocale) => {
    setLocale(next);
    void i18n.changeLanguage(next);
  };

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
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.progress")}</h2>
        {playedLevels.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>Aún no hay actividad registrada.</p>
        ) : (
          <ul>
            {playedLevels.map((p) => (
              <li key={p.levelId}>
                {p.levelId} — {p.timesPlayed} {p.timesPlayed === 1 ? "vez" : "veces"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1rem" }}>{t("parentZone.about")}</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          {t("app.name")} — v0.1.0 (Fase 0). Sin cuentas, sin publicidad, todo el progreso vive en este dispositivo.
        </p>
      </section>
    </div>
  );
}
