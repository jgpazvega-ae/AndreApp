import type { VoiceManifestEntry } from "../index";

/**
 * Clips de voz es-MX generados con ElevenLabs (voz "Camila", cálida, acento
 * mexicano). `reviewed: false` porque PLAN.md §7 exige revisión humana
 * antes de publicar (crítico para fonemas aislados; menos crítico para
 * palabras completas como estas, pero se marca igual para que el flujo de
 * revisión sea consistente en todo el catálogo).
 */
/**
 * Clips que no pertenecen a un nivel: los usa el motor compartido
 * (useGameSession) en TODOS los niveles al equivocarse — elogio de proceso
 * también en el intento fallido (docs/CURRICULUM.md §7). Estaban en disco y
 * en uso desde hace varios niveles, pero sin declarar en ningún manifiesto.
 */
export const COMMON_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "common.encourage.1", file: "encourage-1.mp3", reviewed: false },
  { key: "common.encourage.2", file: "encourage-2.mp3", reviewed: false },
  { key: "common.encourage.3", file: "encourage-3.mp3", reviewed: false },
  { key: "common.encourage.4", file: "encourage-4.mp3", reviewed: false },
];

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

/**
 * N4 reutiliza los n2-praise-*.mp3 al completar una ronda. Los clips de color
 * son de su fase NOMBRADA ("¿dónde está el naranja?" / "¡naranja!"): estaban
 * generados y en uso, pero sin declarar aquí.
 */
export const N4_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n4.welcome", file: "n4-welcome.mp3", reviewed: false },
  { key: "n4.color.orange", file: "n4-color-orange.mp3", reviewed: false },
  { key: "n4.color.indigo", file: "n4-color-indigo.mp3", reviewed: false },
  { key: "n4.color.teal", file: "n4-color-teal.mp3", reviewed: false },
  { key: "n4.exclaim.orange", file: "n4-exclaim-orange.mp3", reviewed: false },
  { key: "n4.exclaim.indigo", file: "n4-exclaim-indigo.mp3", reviewed: false },
  { key: "n4.exclaim.teal", file: "n4-exclaim-teal.mp3", reviewed: false },
];

export const N5_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n5.question.dog", file: "n5-question-dog.mp3", reviewed: false },
  { key: "n5.question.cat", file: "n5-question-cat.mp3", reviewed: false },
  { key: "n5.question.duck", file: "n5-question-duck.mp3", reviewed: false },
  { key: "n5.exclaim.dog", file: "n5-exclaim-dog.mp3", reviewed: false },
  { key: "n5.exclaim.cat", file: "n5-exclaim-cat.mp3", reviewed: false },
  { key: "n5.exclaim.duck", file: "n5-exclaim-duck.mp3", reviewed: false },
];

/** N6 reutiliza los n2-praise-*.mp3 al completar cada rompecabezas. */
export const N6_VOICE_MANIFEST: VoiceManifestEntry[] = [{ key: "n6.welcome", file: "n6-welcome.mp3", reviewed: false }];

export const N7_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n7.question.happy", file: "n7-question-happy.mp3", reviewed: false },
  { key: "n7.question.sad", file: "n7-question-sad.mp3", reviewed: false },
  { key: "n7.question.angry", file: "n7-question-angry.mp3", reviewed: false },
  { key: "n7.question.scared", file: "n7-question-scared.mp3", reviewed: false },
  { key: "n7.exclaim.happy", file: "n7-exclaim-happy.mp3", reviewed: false },
  { key: "n7.exclaim.sad", file: "n7-exclaim-sad.mp3", reviewed: false },
  { key: "n7.exclaim.angry", file: "n7-exclaim-angry.mp3", reviewed: false },
  { key: "n7.exclaim.scared", file: "n7-exclaim-scared.mp3", reviewed: false },
];

/** N8 reutiliza los n2-praise-*.mp3 al completar la racha de 3. */
export const N8_VOICE_MANIFEST: VoiceManifestEntry[] = [{ key: "n8.welcome", file: "n8-welcome.mp3", reviewed: false }];

export const N9_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n9.question.1", file: "n9-question-1.mp3", reviewed: false },
  { key: "n9.question.2", file: "n9-question-2.mp3", reviewed: false },
  { key: "n9.question.3", file: "n9-question-3.mp3", reviewed: false },
  { key: "n9.exclaim.1", file: "n9-exclaim-1.mp3", reviewed: false },
  { key: "n9.exclaim.2", file: "n9-exclaim-2.mp3", reviewed: false },
  { key: "n9.exclaim.3", file: "n9-exclaim-3.mp3", reviewed: false },
];

export const N10_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n10.welcome", file: "n10-welcome.mp3", reviewed: false },
  { key: "n10.count.1", file: "n10-count-1.mp3", reviewed: false },
  { key: "n10.count.2", file: "n10-count-2.mp3", reviewed: false },
  { key: "n10.count.3", file: "n10-count-3.mp3", reviewed: false },
  { key: "n10.count.4", file: "n10-count-4.mp3", reviewed: false },
  { key: "n10.count.5", file: "n10-count-5.mp3", reviewed: false },
  { key: "n10.finish", file: "n10-finish.mp3", reviewed: false },
];

/** N11 reutiliza n10-finish.mp3 al llegar a la meta: el mensaje es el mismo sin importar el rango contado. */
export const N11_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n11.welcome", file: "n11-welcome.mp3", reviewed: false },
  { key: "n11.count.6", file: "n11-count-6.mp3", reviewed: false },
  { key: "n11.count.7", file: "n11-count-7.mp3", reviewed: false },
  { key: "n11.count.8", file: "n11-count-8.mp3", reviewed: false },
  { key: "n11.count.9", file: "n11-count-9.mp3", reviewed: false },
  { key: "n11.count.10", file: "n11-count-10.mp3", reviewed: false },
];

/** N12 reutiliza los n2-praise-*.mp3 al completar una ronda. Sin voces que nombren cada forma: el
 * patrón se enseña por razonamiento visual, no por vocabulario (a diferencia de N4/N5/N7/N9). */
export const N12_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n12.welcome", file: "n12-welcome.mp3", reviewed: false },
];

/** N13 reutiliza object-star/bell/balloon/flower.mp3 (ya existen desde N1) para 4 de los 6
 * tipos de tarjeta; gato y pato necesitan su propio nombre en voz (N5 solo tiene el sonido
 * del animal y una exclamación completa, no el sustantivo suelto que hace falta aquí). */
export const N13_VOICE_MANIFEST: VoiceManifestEntry[] = [
  { key: "n13.welcome", file: "n13-welcome.mp3", reviewed: false },
  { key: "n13.name.cat", file: "n13-name-cat.mp3", reviewed: false },
  { key: "n13.name.duck", file: "n13-name-duck.mp3", reviewed: false },
];

/**
 * Índice completo del paquete de voz es-MX. Es lo que permite comprobar
 * automáticamente (ver apps/web/src/__tests__/voiceAssets.test.ts) que lo
 * declarado, lo que hay en disco y lo que el código pide son la misma lista:
 * un clip que falta NO se ve como un error, se oye como silencio.
 */
export const ES_MX_VOICE_MANIFEST: VoiceManifestEntry[] = [
  ...COMMON_VOICE_MANIFEST,
  ...N1_VOICE_MANIFEST,
  ...N2_VOICE_MANIFEST,
  ...N3_VOICE_MANIFEST,
  ...N4_VOICE_MANIFEST,
  ...N5_VOICE_MANIFEST,
  ...N6_VOICE_MANIFEST,
  ...N7_VOICE_MANIFEST,
  ...N8_VOICE_MANIFEST,
  ...N9_VOICE_MANIFEST,
  ...N10_VOICE_MANIFEST,
  ...N11_VOICE_MANIFEST,
  ...N12_VOICE_MANIFEST,
  ...N13_VOICE_MANIFEST,
];
