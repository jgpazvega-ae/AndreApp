import { ContarPista } from "../n10/ContarPista";

const CHECKPOINTS = [6, 7, 8, 9, 10] as const;
/**
 * La parada K tiene K objetos y SIEMPRE se cuenta desde 1 (igual que N10):
 * la parada de 6 objetos dice "uno, dos... seis", la de 7 dice "uno,
 * dos... siete", etc. — nunca empieza a contar en 6. Por eso el conteo
 * acumulado real va de 1 a 10 a lo largo del nivel, no solo de 6 a 10:
 * 1-5 reutiliza las voces de N10 (el mismo "uno"/"dos"... sin importar el
 * nivel) y solo 6-10 son voces nuevas de N11.
 */
const COUNT_FILE: Record<number, string> = {
  1: "n10-count-1.mp3",
  2: "n10-count-2.mp3",
  3: "n10-count-3.mp3",
  4: "n10-count-4.mp3",
  5: "n10-count-5.mp3",
  6: "n11-count-6.mp3",
  7: "n11-count-7.mp3",
  8: "n11-count-8.mp3",
  9: "n11-count-9.mp3",
  10: "n11-count-10.mp3",
};

interface N11Contar6a10Props {
  locale: string;
  onExit: () => void;
}

/**
 * N11 · Contar 6-10 (docs/CURRICULUM.md ficha N11: "igual que N10 con
 * conjuntos 6-10"). Mismo motor compartido ContarPista que N10 — la meta
 * comparte el clip "Llegaste a la meta" de N10 porque el logro de cruzar la
 * meta es el mismo mensaje sin importar el rango que se contó.
 */
export function N11Contar6a10({ locale, onExit }: N11Contar6a10Props) {
  return (
    <ContarPista
      levelId="n11"
      locale={locale}
      onExit={onExit}
      checkpoints={CHECKPOINTS}
      countFile={(count) => COUNT_FILE[count] ?? COUNT_FILE[6]!}
      welcomeFile="n11-welcome.mp3"
      finishFile="n10-finish.mp3"
      background="linear-gradient(160deg, #FFDFAE 0%, #F2933E 100%)"
    />
  );
}
