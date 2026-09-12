/**
 * Utilidades de azar compartidas por los juegos.
 *
 * Viven aquí (y no dentro de cada nivel) porque el currículo tiene 22
 * niveles y casi todos barajan o eligen al azar: duplicar la lógica en
 * cada uno es la forma más fácil de que se desincronicen.
 */

/** Copia barajada (Fisher-Yates). No muta el arreglo original. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Elige un elemento al azar. Requiere un arreglo no vacío — el tipo lo
 * garantiza para que el llamador no tenga que manejar `undefined`
 * (tsconfig usa noUncheckedIndexedAccess).
 */
export function pickRandom<T>(items: readonly [T, ...T[]]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/**
 * Elige un elemento al azar distinto del actual. Se usa para no repetir
 * dos veces seguidas la misma consigna (docs/CURRICULUM.md §2: la
 * repetición inmediata hace que el niño acierte por inercia, no por
 * comprensión).
 */
export function pickRandomExcept<T>(items: readonly [T, ...T[]], exclude: T | null): T {
  const options = items.filter((item) => item !== exclude);
  if (options.length === 0) return items[0];
  return options[Math.floor(Math.random() * options.length)]!;
}
