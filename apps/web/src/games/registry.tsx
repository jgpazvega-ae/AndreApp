import type { ComponentType } from "react";
import { N1CausaEfecto } from "./n1/N1CausaEfecto";
import { N2TocaAlObjetivo } from "./n2/N2TocaAlObjetivo";
import { N3EmparejarIdenticos } from "./n3/N3EmparejarIdenticos";
import { N4ClasificarPorAtributo } from "./n4/N4ClasificarPorAtributo";
import { N5VocabularioYSonidos } from "./n5/N5VocabularioYSonidos";
import { N6Rompecabezas } from "./n6/N6Rompecabezas";
import { N7Emociones } from "./n7/N7Emociones";
import { N8ParaYSigue } from "./n8/N8ParaYSigue";
import { N9Subitizar } from "./n9/N9Subitizar";
import { N10ContarPista } from "./n10/N10ContarPista";

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
  n6: N6Rompecabezas,
  n7: N7Emociones,
  n8: N8ParaYSigue,
  n9: N9Subitizar,
  n10: N10ContarPista,
};
