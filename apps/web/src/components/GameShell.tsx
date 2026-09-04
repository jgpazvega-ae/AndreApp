import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DecorBlobs } from "./DecorBlobs";
import { GameBuddy } from "./GameBuddy";

interface GameShellProps {
  /** Id del nivel (p. ej. "n3"): decide qué perrito acompaña esta pantalla. */
  levelId: string;
  onExit: () => void;
  /** Fondo del nivel: cada uno tiene su color para que el niño los distinga sin leer. */
  background: string;
  /** Contador de aciertos de useGameSession; hace saltar al compañero. */
  celebrateSignal: number;
  /** El campo de confeti de useGameSession. */
  confetti: ReactNode;
  /** Burbujas decorativas de fondo. Se apagan en niveles donde competirían con el contenido. */
  decor?: boolean;
  /** Para niveles donde el área completa es la zona tocable (N1). */
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  /** Ajustes de layout del contenedor (p. ej. columna flex). */
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Marco común de todas las pantallas de juego: fondo, decoración, salida,
 * confeti y compañero perruno.
 *
 * Existe para que agregar un nivel nuevo (quedan 17 de 22) sea escribir
 * solo su mecánica, y para que la salida y la retroalimentación se
 * comporten idénticas en todos — un niño de 0 a 5 no debería tener que
 * reaprender dónde está el botón de regresar en cada juego.
 */
export function GameShell({
  levelId,
  onExit,
  background,
  celebrateSignal,
  confetti,
  decor = true,
  onPointerDown,
  style,
  children,
}: GameShellProps) {
  const { t } = useTranslation();

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: "relative",
        flex: 1,
        minHeight: "100vh",
        overflow: "hidden",
        background,
        touchAction: "manipulation",
        ...style,
      }}
    >
      {decor && <DecorBlobs />}

      <button
        type="button"
        aria-label={t("common.back")}
        onClick={(e) => {
          e.stopPropagation();
          onExit();
        }}
        // N1 escucha toques en todo el contenedor y `pointerdown` se propaga antes
        // que `click`: sin frenarlo aquí, tocar "regresar" también dispara un acierto.
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "max(env(safe-area-inset-top), 16px)",
          left: 16,
          zIndex: 10,
          width: 48,
          height: 48,
          borderRadius: "var(--radius-pill)",
          background: "rgba(255,255,255,0.85)",
          fontSize: "1.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⬅️
      </button>

      <GameBuddy levelId={levelId} celebrateSignal={celebrateSignal} />

      {confetti}

      {children}
    </div>
  );
}
