import esMX from "./locales/es-MX.json";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";

export { N1_VOICE_MANIFEST, N2_VOICE_MANIFEST, N3_VOICE_MANIFEST, N4_VOICE_MANIFEST } from "./voiceManifests/es-MX";

/**
 * Cadenas de la zona de padres y títulos de nivel (accesibles/parent-facing).
 * El niño nunca lee texto en la app (ver docs/CURRICULUM.md §2); estas
 * cadenas se usan en la zona de padres y como etiquetas de accesibilidad.
 */
export const RESOURCES = {
  "es-MX": { translation: esMX },
  en: { translation: en },
  "pt-BR": { translation: ptBR },
} as const;

/**
 * Manifiesto de un paquete de voz pregenerada (ElevenLabs) por idioma.
 * El contenido real de audio se genera con scripts/gen-voices y se sirve
 * como assets estáticos; este tipo describe el índice, no el audio.
 */
export interface VoiceManifestEntry {
  /** Clave del clip, p. ej. "n1.welcome" o "number.3". */
  key: string;
  /** Ruta relativa del archivo de audio dentro de apps/web/public/audio/<locale>/. */
  file: string;
  /** true una vez que un humano revisó el clip (obligatorio para fonemas, PLAN.md §7). */
  reviewed: boolean;
}
