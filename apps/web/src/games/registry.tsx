import type { ComponentType } from "react";
import { N1CausaEfecto } from "./n1/N1CausaEfecto";
import { N2TocaAlObjetivo } from "./n2/N2TocaAlObjetivo";
import { N3EmparejarIdenticos } from "./n3/N3EmparejarIdenticos";
import { N4ClasificarPorAtributo } from "./n4/N4ClasificarPorAtributo";
import { N5VocabularioYSonidos } from "./n5/N5VocabularioYSonidos";

export interface GameProps {
  locale: string;
  onExit: () => void;
}

/** Mapa nivel → componente jugable. Los niveles sin entrada aquí son "coming-soon". */
export const GAME_REGISTRY: Record<string, ComponentType<GameProps>> = {
  n1: N1CausaEfecto,
  n2: N2TocaAlObjetivo,
  n3: N3EmparejarIdenticos,
  n4: N4ClasificarPorAtributo,
  n5: N5VocabularioYSonidos,
};
