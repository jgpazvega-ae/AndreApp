import { Howl, Howler } from "howler";
import { asset } from "../utils/asset";

/**
 * Motor de audio con desbloqueo explícito por gesto del usuario.
 *
 * iOS Safari bloquea todo audio (incluida la Web Audio API) hasta que el
 * usuario interactúa directamente con la página (PLAN.md §2, restricciones
 * de PWA en iOS). `unlockAudio()` debe llamarse desde el handler de un tap
 * real (ver <AudioUnlockGate>), nunca automáticamente al cargar la app.
 */

let unlocked = false;
const listeners = new Set<() => void>();
const howlCache = new Map<string, Howl>();

export function isAudioUnlocked(): boolean {
  return unlocked;
}

export function onAudioUnlock(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Debe invocarse síncronamente dentro de un gesto de usuario (tap/click). */
export function unlockAudio(): void {
  if (unlocked) return;

  const ctx = Howler.ctx as AudioContext | undefined;
  if (ctx) {
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    // Truco estándar de "silent buffer" para despertar la Web Audio API en iOS.
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      // Si falla el truco, igual seguimos: Howler reintentará al reproducir.
    }
  }

  unlocked = true;
  listeners.forEach((cb) => cb());
}

function getHowl(src: string): Howl {
  const cached = howlCache.get(src);
  if (cached) return cached;
  // El handler de error se registra UNA vez, al crear el Howl: hacerlo en cada
  // reproducción acumulaba listeners sobre el mismo objeto cacheado.
  const howl = new Howl({
    src: [src],
    html5: false,
    preload: true,
    onloaderror: () => {
      console.warn(`[audio] No se pudo cargar el clip de voz: ${src}`);
    },
  });
  howlCache.set(src, howl);
  return howl;
}

/** Reproduce un clip de voz pregenerado. No lanza si el archivo falta (p. ej. idiomas sin voces aún). */
export function playVoiceClip(locale: string, file: string): void {
  if (!unlocked) return;
  getHowl(asset(`audio/${locale}/${file}`)).play();
}

/**
 * Reproduce un efecto de sonido compartido entre idiomas (p. ej. el sonido
 * real de un animal). Vive en `audio/shared/` porque un ladrido o un maullido
 * es igual en cualquier idioma — no hay que duplicarlo por locale.
 */
export function playSound(file: string): void {
  if (!unlocked) return;
  getHowl(asset(`audio/shared/${file}`)).play();
}

/**
 * "Pop" de retroalimentación sintetizado con Web Audio (sin asset externo):
 * un tono corto y alegre para el toque, independiente de las voces.
 */
export function playChime(): void {
  if (!unlocked) return;
  const ctx = Howler.ctx as AudioContext | undefined;
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(990, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

/**
 * Arpegio mayor ascendente (Do–Mi–Sol–Do) sintetizado: el sonido de
 * "¡lo lograste!" para un acierto, más rico que el pop del toque. Las
 * notas son de un acorde mayor, así que nunca suena disonante — igual que
 * el remate de las apps de la referencia. No pisa las voces: es breve y
 * suave, y se dispara junto al confeti al celebrar (ver useGameSession).
 */
export function playSparkle(): void {
  if (!unlocked) return;
  const ctx = Howler.ctx as AudioContext | undefined;
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  for (let i = 0; i < notes.length; i++) {
    const t = now + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(notes[i]!, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }
}

/** Un tono simple con rampa de frecuencia, bloque base de los sonidos de Explorar. */
function tone(
  ctx: AudioContext,
  startTime: number,
  freqFrom: number,
  freqTo: number,
  duration: number,
  peakGain = 0.2,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, startTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), startTime + duration);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + Math.min(0.03, duration * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/**
 * Sonidos de causa-efecto de las escenas Explorar (Product Vision §6),
 * sintetizados igual que playChime/playSparkle: sin archivos nuevos que
 * generar, revisar ni registrar en el manifiesto de voces — cada objeto
 * de una escena nueva solo elige uno de estos siete timbres.
 */
export type ExploreSoundKind = "shine" | "drift" | "fly" | "shed-leaves" | "flutter" | "bounce" | "sway";

export function playExploreSound(kind: ExploreSoundKind): void {
  if (!unlocked) return;
  const ctx = Howler.ctx as AudioContext | undefined;
  if (!ctx) return;
  const now = ctx.currentTime;

  switch (kind) {
    // Sol: brillo cálido, dos notas ascendentes rápidas.
    case "shine":
      tone(ctx, now, 700, 1100, 0.18, 0.22, "sine");
      tone(ctx, now + 0.1, 1000, 1500, 0.22, 0.16, "sine");
      break;
    // Nube: un soplo suave y grave, casi un susurro.
    case "drift":
      tone(ctx, now, 260, 180, 0.4, 0.1, "sine");
      break;
    // Pájaro: dos chirridos cortos y agudos.
    case "fly":
      tone(ctx, now, 1400, 1900, 0.09, 0.16, "triangle");
      tone(ctx, now + 0.12, 1600, 2100, 0.09, 0.14, "triangle");
      break;
    // Árbol: crujido de hojas — varias notas cortas descendentes, como un rastrillo.
    case "shed-leaves":
      for (let i = 0; i < 4; i++) {
        tone(ctx, now + i * 0.06, 900 - i * 90, 500 - i * 60, 0.08, 0.08, "triangle");
      }
      break;
    // Mariposa: aleteo ligero, trino rápido de dos notas.
    case "flutter":
      for (let i = 0; i < 3; i++) {
        tone(ctx, now + i * 0.09, 1200, 1450, 0.08, 0.1, "sine");
      }
      break;
    // Pelota: "boing" — cae de tono con cada rebote, cada vez más suave.
    case "bounce":
      tone(ctx, now, 500, 260, 0.16, 0.2, "square");
      tone(ctx, now + 0.18, 420, 240, 0.13, 0.12, "square");
      tone(ctx, now + 0.33, 360, 230, 0.1, 0.07, "square");
      break;
    // Flor: dos notas suaves y cálidas, como una campanita pequeña.
    case "sway":
      tone(ctx, now, 880, 880, 0.2, 0.14, "sine");
      tone(ctx, now + 0.14, 1046, 1046, 0.25, 0.12, "sine");
      break;
  }
}
