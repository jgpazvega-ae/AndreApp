import type { VoiceManifestEntry } from "../index";

/**
 * Clips de voz es-MX generados con ElevenLabs (voz "Camila", cálida, acento
 * mexicano). `reviewed: false` porque PLAN.md §7 exige revisión humana
 * antes de publicar (crítico para fonemas aislados; menos crítico para
 * palabras completas como estas, pero se marca igual para que el flujo de
 * revisión sea consistente en todo el catálogo).
 */
export const N1_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n1.welcome", file: "welcome.mp3", reviewed: false },
  { key: "n1.object.star", file: "object-star.mp3", reviewed: false },
  { key: "n1.object.bell", file: "object-bell.mp3", reviewed: false },
  { key: "n1.object.balloon", file: "object-balloon.mp3", reviewed: false },
  { key: "n1.object.flower", file: "object-flower.mp3", reviewed: false },
];

export const N2_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n2.welcome", file: "n2-welcome.mp3", reviewed: false },
  { key: "n2.praise.1", file: "n2-praise-1.mp3", reviewed: false },
  { key: "n2.praise.2", file: "n2-praise-2.mp3", reviewed: false },
  { key: "n2.praise.3", file: "n2-praise-3.mp3", reviewed: false },
  { key: "n2.praise.4", file: "n2-praise-4.mp3", reviewed: false },
];

/** N3 reutiliza los clips object-*.mp3 de N1 (nombra el objeto al emparejar) y los n2-praise-*.mp3 (ronda completa). */
export const N3_VOICE_MANIFEST: VoiceManifestEntry[] = [{ key: "n3.welcome", file: "n3-welcome.mp3", reviewed: false }];

/** N4 (perceptual, sin nombrar el color) reutiliza los n2-praise-*.mp3 al completar una ronda. */
export const N4_VOICE_MANIFEST: VoiceManifestEntry[] = [{ key: "n4.welcome", file: "n4-welcome.mp3", reviewed: false }];
