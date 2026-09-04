/**
 * Resuelve la ruta de un asset público respetando el base path de
 * despliegue: "/" en producción normal (Neubox/Render), "/AndreApp/" en
 * GitHub Pages (vite.config.ts, VITE_BASE_PATH). Usar siempre esta función
 * en vez de una ruta absoluta literal ("/illustrations/foo.png") al
 * referenciar archivos de apps/web/public/, para que funcionen igual bajo
 * cualquier base.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL; // siempre termina en "/"
  return base + path.replace(/^\//, "");
}
