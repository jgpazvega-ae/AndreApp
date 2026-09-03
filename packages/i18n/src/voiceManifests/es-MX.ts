import type { VoiceManifestEntry } from "../index";

/**
 * Clips de voz es-MX generados con ElevenLabs (voz "Camila", cálida, acento
 * mexicano) para el nivel N1 · Causa y efecto. `reviewed: false` porque
 * PLAN.md §7 exige revisión humana antes de publicar (crítico para fonemas
 * aislados; menos crítico para palabras completas como estas, pero se marca
 * igual para que el flujo de revisión sea consistente en todo el catálogo).
 */
export const N1_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n1.welcome", file: "welcome.mp3", reviewed: false },
  { key: "n1.object.star", file: "object-star.mp3", reviewed: false },
  { key: "n1.object.bell", file: "object-bell.mp3", reviewed: false },
  { key: "n1.object.balloon", file: "object-balloon.mp3", reviewed: false },
  { key: "n1.object.flower", file: "object-flower.mp3", reviewed: false },
];
