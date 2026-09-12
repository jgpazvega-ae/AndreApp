import { ContarPista } from "./ContarPista";

const CHECKPOINTS = [1, 2, 3, 4, 5] as const;
const COUNT_FILE: Record<number, string> = {
  1: "n10-count-1.mp3",
  2: "n10-count-2.mp3",
  3: "n10-count-3.mp3",
  4: "n10-count-4.mp3",
  5: "n10-count-5.mp3",
};

interface N10ContarPistaProps {
  locale: string;
  onExit: () => void;
}

/**
 * N10 · Contar 1-5, "la pista de números" (docs/CURRICULUM.md ficha N10:
 * correspondencia uno a uno y cardinalidad). Envoltorio delgado sobre el
 * motor compartido ContarPista — ver ese archivo para la mecánica.
 */
export function N10ContarPista({ locale, onExit }: N10ContarPistaProps) {
  return (
    <ContarPista
      levelId="n10"
      locale={locale}
      onExit={onExit}
      checkpoints={CHECKPOINTS}
      countFile={(count) => COUNT_FILE[count] ?? COUNT_FILE[1]!}
      welcomeFile="n10-welcome.mp3"
      finishFile="n10-finish.mp3"
      background="linear-gradient(160deg, #FFE9C7 0%, #FFC26B 100%)"
    />
  );
}
