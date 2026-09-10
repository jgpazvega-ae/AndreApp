export type BuddyId = "odie" | "dante" | "kira";

export interface Buddy {
  id: BuddyId;
  /** Clave i18n del nombre (para el aria-label; el niño nunca lee texto en pantalla). */
  nameKey: string;
  /** Ladrido propio, independiente del idioma (vive en audio/shared/, como los sonidos de animales de N5). */
  barkSound: string;
}

/**
 * Los 3 perritos reales de la familia (a petición del usuario), cada uno con su
 * propio nombre, carácter y ladrido — ya no una rotación anónima por nivel
 * (ver docs de useSelectedBuddy). Personalidad de cada uno, para quien toque
 * este archivo después:
 *  - Odie: muy juguetón, pero también un poco gruñón/mandón.
 *  - Dante: el mayor, tranquilo y sabio, el más protector.
 *  - Kira: busca atención, consentida, lista, brinca muchísimo.
 */
export const BUDDIES: [Buddy, Buddy, Buddy] = [
  {
    id: "odie",
    nameKey: "buddy.odie.name",
    barkSound: "buddy-odie-bark.mp3",
  },
  {
    id: "dante",
    nameKey: "buddy.dante.name",
    barkSound: "buddy-dante-bark.mp3",
  },
  {
    id: "kira",
    nameKey: "buddy.kira.name",
    barkSound: "buddy-kira-bark.mp3",
  },
];

export function getBuddy(id: BuddyId | null): Buddy {
  return BUDDIES.find((b) => b.id === id) ?? BUDDIES[0];
}
