import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AppLocale, LevelProgress } from "@andreapp/shared";
import { DEFAULT_LOCALE } from "@andreapp/shared";

localforage.config({ name: "andreapp", storeName: "progress" });

/** Adaptador mínimo IndexedDB (localforage) para el middleware persist de zustand. */
const indexedDbStorage: StateStorage = {
  getItem: async (name) => (await localforage.getItem<string>(name)) ?? null,
  setItem: async (name, value) => localforage.setItem(name, value),
  removeItem: async (name) => localforage.removeItem(name),
};

export type SensoryMode = "normal" | "calm";

interface ProgressState {
  locale: AppLocale;
  sensoryMode: SensoryMode;
  levels: Record<string, LevelProgress>;
  setLocale: (locale: AppLocale) => void;
  setSensoryMode: (mode: SensoryMode) => void;
  recordPlay: (levelId: string) => void;
  setMastered: (levelId: string, mastered: boolean) => void;
  /** Se llama cuando useGameSession cierra una ronda (ver LevelCompleteOverlay). */
  recordRoundComplete: (levelId: string) => void;
}

/**
 * Progreso 100% local (offline-first). Ver docs/CURRICULUM.md §6: la
 * maestría no es un examen — solo habilita una sugerencia de desbloqueo,
 * nunca bloquea el juego libre de niveles ya vistos.
 */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      sensoryMode: "normal",
      levels: {},

      setLocale: (locale) => set({ locale }),
      setSensoryMode: (sensoryMode) => set({ sensoryMode }),

      recordPlay: (levelId) =>
        set((state) => {
          const existing = state.levels[levelId];
          const entry: LevelProgress = {
            levelId,
            timesPlayed: (existing?.timesPlayed ?? 0) + 1,
            mastered: existing?.mastered ?? false,
            lastPlayedAt: new Date().toISOString(),
            roundsCompleted: existing?.roundsCompleted ?? 0,
          };
          return { levels: { ...state.levels, [levelId]: entry } };
        }),

      setMastered: (levelId, mastered) =>
        set((state) => {
          const existing = state.levels[levelId];
          const entry: LevelProgress = {
            levelId,
            timesPlayed: existing?.timesPlayed ?? 0,
            mastered,
            lastPlayedAt: existing?.lastPlayedAt ?? null,
            roundsCompleted: existing?.roundsCompleted ?? 0,
          };
          return { levels: { ...state.levels, [levelId]: entry } };
        }),

      recordRoundComplete: (levelId) =>
        set((state) => {
          const existing = state.levels[levelId];
          const entry: LevelProgress = {
            levelId,
            timesPlayed: existing?.timesPlayed ?? 0,
            mastered: existing?.mastered ?? false,
            lastPlayedAt: existing?.lastPlayedAt ?? null,
            roundsCompleted: (existing?.roundsCompleted ?? 0) + 1,
          };
          return { levels: { ...state.levels, [levelId]: entry } };
        }),
    }),
    {
      name: "andreapp-progress",
      storage: createJSONStorage(() => indexedDbStorage),
    },
  ),
);
