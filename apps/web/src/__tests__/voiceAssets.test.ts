import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ES_MX_VOICE_MANIFEST } from "@andreapp/i18n";

const WEB_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SRC = join(WEB_ROOT, "src");
const VOICE_DIR = join(WEB_ROOT, "public/audio/es-MX");
const SHARED_DIR = join(WEB_ROOT, "public/audio/shared");

/**
 * Por qué existe esta prueba (y por qué no basta con las e2e):
 *
 * Esta app se juega ESCUCHANDO. Un nombre de archivo de audio mal escrito no
 * lanza ningún error visible: Howler falla en silencio, el niño no oye la
 * consigna y el juego parece "mudo pero funcionando". Peor aún, las pruebas
 * e2e corren contra `vite preview`, que responde **200 con el index.html** a
 * cualquier ruta inexistente — así que su vigilancia de "no hay 404" NO
 * detecta un clip que falta. Este chequeo, en cambio, mira el disco.
 *
 * Con 11 niveles hechos y 11 por hacer (cada uno con ~6 clips nuevos), es la
 * red que evita publicar un nivel mudo.
 */

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

/** Nombres de archivo .mp3 escritos como literal en el código de la app. */
function referencedAudioFiles(): Map<string, string[]> {
  const refs = new Map<string, string[]>();
  for (const file of walk(SRC)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/["'`]([A-Za-z0-9._-]+\.mp3)["'`]/g)) {
      const name = match[1]!;
      refs.set(name, [...(refs.get(name) ?? []), file.replace(WEB_ROOT, "")]);
    }
  }
  return refs;
}

const onDisk = (dir: string) => new Set(readdirSync(dir).filter((f) => f.endsWith(".mp3")));

describe("clips de audio", () => {
  it("todo archivo que el código reproduce existe en disco", () => {
    const voices = onDisk(VOICE_DIR);
    const shared = onDisk(SHARED_DIR);
    const missing = [...referencedAudioFiles().entries()]
      .filter(([file]) => !voices.has(file) && !shared.has(file))
      .map(([file, usedIn]) => `${file} (usado en ${usedIn.join(", ")})`);
    expect(missing).toEqual([]);
  });

  it("todo clip declarado en el manifiesto es-MX existe en disco", () => {
    const voices = onDisk(VOICE_DIR);
    const missing = ES_MX_VOICE_MANIFEST.filter((entry) => !voices.has(entry.file)).map((entry) => entry.file);
    expect(missing).toEqual([]);
  });

  it("todo clip en disco está declarado en el manifiesto es-MX", () => {
    // Al revés: un clip generado y guardado pero sin declarar queda fuera del
    // flujo de revisión humana que exige PLAN.md §7 (nadie sabe que existe).
    const declared = new Set(ES_MX_VOICE_MANIFEST.map((entry) => entry.file));
    const undeclared = [...onDisk(VOICE_DIR)].filter((file) => !declared.has(file));
    expect(undeclared).toEqual([]);
  });

  it("el manifiesto no declara dos veces el mismo clip ni la misma clave", () => {
    const files = ES_MX_VOICE_MANIFEST.map((entry) => entry.file);
    const keys = ES_MX_VOICE_MANIFEST.map((entry) => entry.key);
    expect(new Set(files).size).toBe(files.length);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
