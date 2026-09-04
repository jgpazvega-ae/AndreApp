/**
 * Encuentra el objetivo de suelta bajo un punto, con un margen de captura
 * generoso ("imán"): docs/CURRICULUM.md §2 pide que todo arrastre tenga un
 * radio de acierto amplio, porque a los 2-4 años la puntería fina todavía
 * falla. Se usa junto al `drag` de framer-motion para decidir dónde "cayó"
 * la pieza soltada — sin esto, un arrastre real sería frustrante y
 * exigiría precisión que la edad objetivo no tiene.
 */
export function findDropTarget<T>(
  point: { x: number; y: number },
  refs: Map<T, HTMLElement | null>,
  margin = 0,
): T | null {
  for (const [key, el] of refs) {
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (
      point.x >= rect.left - margin &&
      point.x <= rect.right + margin &&
      point.y >= rect.top - margin &&
      point.y <= rect.bottom + margin
    ) {
      return key;
    }
  }
  return null;
}
