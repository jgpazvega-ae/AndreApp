import type { ComponentType } from "react";
import { N1CausaEfecto } from "./n1/N1CausaEfecto";

export interface GameProps {
  locale: string;
  onExit: () => void;
}

/** Mapa nivel → componente jugable. Los niveles sin entrada aquí son "coming-soon". */
export const GAME_REGISTRY: Record<string, ComponentType<GameProps>> = {
  n1: N1CausaEfecto,
};
