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
  const howl = new Howl({ src: [src], html5: false, preload: true });
  howlCache.set(src, howl);
  return howl;
}

/** Reproduce un clip de voz pregenerado. No lanza si el archivo falta (assets aún por generar). */
export function playVoiceClip(locale: string, file: string): void {
  if (!unlocked) return;
  const src = asset(`audio/${locale}/${file}`);
  const howl = getHowl(src);
  howl.once("loaderror", () => {
    console.warn(`[audio] No se pudo cargar el clip de voz: ${src}`);
  });
  howl.play();
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
