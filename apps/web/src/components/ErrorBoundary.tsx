import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { asset } from "../utils/asset";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Se llama al tocar "volver al inicio", para que la app salga de la pantalla rota. */
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Red de seguridad: si un nivel truena, el niño ve a la mascota y un botón
 * grande para volver, no una pantalla en blanco. Importa más de lo normal
 * aquí porque quien usa la app no sabe leer ni puede pedir ayuda: una
 * pantalla vacía en el teléfono de su papá no tiene salida posible.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[anico] Error no controlado en la UI:", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    this.props.onReset();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorScreen onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorScreen({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      style={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        padding: "var(--space-lg)",
        textAlign: "center",
        background: "var(--color-bg)",
      }}
    >
      <img src={asset("illustrations/mascot.png")} alt="" aria-hidden="true" style={{ width: "min(45vw, 180px)" }} />
      <h1 style={{ fontSize: "1.3rem", margin: 0 }}>{t("error.title")}</h1>
      <p style={{ color: "var(--color-text-muted)", margin: 0 }}>{t("error.body")}</p>
      <button
        type="button"
        onClick={onReset}
        style={{
          marginTop: "var(--space-sm)",
          padding: "var(--space-md) var(--space-lg)",
          borderRadius: "var(--radius-pill)",
          background: "var(--color-accent)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "1.05rem",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {t("error.action")}
      </button>
    </div>
  );
}
