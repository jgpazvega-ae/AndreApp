import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AppLocale, LevelProgress } from "@andreapp/shared";
import { DEFAULT_LOCALE } from "@andreapp/shared";
import { BASE_DIFFICULTY, nextDifficultyState, type DifficultyState } from "./adaptiveDifficulty";
import type { BuddyId } from "../data/buddies";

localforage.config({ name: "andreapp", storeName: "progress" });

/** Adaptador mínimo IndexedDB (localforage) para el middleware persist de zustand. */
const indexedDbStorage: StateStorage = {
  getItem: async (name) => (await localforage.getItem<string>(name)) ?? null,
  setItem: async (name, value) => localforage.setItem(name, value),
  removeItem: async (name) => localforage.removeItem(name),
};

export type SensoryMode = "normal" | "calm";

/** Copia los campos de dificultad adaptativa de una entrada existente (o su punto de partida). */
function difficultyDefaults(existing: LevelProgress | undefined): DifficultyState {
  return existing
    ? {
        difficultyLevel: existing.difficultyLevel,
        easyStreak: existing.easyStreak,
        struggleStreak: existing.struggleStreak,
      }
    : BASE_DIFFICULTY;
}

interface ProgressState {
  locale: AppLocale;
  sensoryMode: SensoryMode;
  levels: Record<string, LevelProgress>;
  /** El compañero perruno que el niño eligió en la pantalla de inicio (null = aún no elige). */
  selectedBuddy: BuddyId | null;
  /** Niveles/escenas marcados con el corazón en Favoritos (id de nivel o "explore:<sceneId>"). */
  favoriteIds: string[];
  /** Objetos ya descubiertos por escena Explorar (docs/CURRICULUM.md — nunca es una mecánica de recompensa forzada). */
  discoveries: Record<string, string[]>;
  setLocale: (locale: AppLocale) => void;
  setSensoryMode: (mode: SensoryMode) => void;
  recordPlay: (levelId: string) => void;
  setMastered: (levelId: string, mastered: boolean) => void;
  /** Se llama cuando useGameSession cierra una ronda (ver LevelCompleteOverlay). */
  recordRoundComplete: (levelId: string) => void;
  /** Dificultad adaptativa: registra un acierto (true) o un intento con ayuda (false). */
  recordAttemptOutcome: (levelId: string, correct: boolean) => void;
  setSelectedBuddy: (buddy: BuddyId) => void;
  toggleFavorite: (id: string) => void;
  recordDiscovery: (sceneId: string, objectId: string) => void;
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
      selectedBuddy: null,
      favoriteIds: [],
      discoveries: {},

      setLocale: (locale) => set({ locale }),
      setSensoryMode: (sensoryMode) => set({ sensoryMode }),
      setSelectedBuddy: (selectedBuddy) => set({ selectedBuddy }),

      toggleFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((existing) => existing !== id)
            : [...state.favoriteIds, id],
        })),

      recordDiscovery: (sceneId, objectId) =>
        set((state) => {
          const existing = state.discoveries[sceneId] ?? [];
          if (existing.includes(objectId)) return state;
          return { discoveries: { ...state.discoveries, [sceneId]: [...existing, objectId] } };
        }),

      recordPlay: (levelId) =>
        set((state) => {
          const existing = state.levels[levelId];
          const entry: LevelProgress = {
            levelId,
            timesPlayed: (existing?.timesPlayed ?? 0) + 1,
            mastered: existing?.mastered ?? false,
            lastPlayedAt: new Date().toISOString(),
            roundsCompleted: existing?.roundsCompleted ?? 0,
            ...difficultyDefaults(existing),
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
            ...difficultyDefaults(existing),
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
            ...difficultyDefaults(existing),
          };
          return { levels: { ...state.levels, [levelId]: entry } };
        }),

      /**
       * Dificultad adaptativa (ver adaptiveDifficulty.ts para los umbrales
       * exactos, probados ahí de forma aislada): solo conecta el `levelId`
       * con la lógica pura de cuándo subir o bajar un nivel de reto.
       */
      recordAttemptOutcome: (levelId, correct) =>
        set((state) => {
          const existing = state.levels[levelId];
          const difficulty = nextDifficultyState(difficultyDefaults(existing), correct);
          const entry: LevelProgress = {
            levelId,
            timesPlayed: existing?.timesPlayed ?? 0,
            mastered: existing?.mastered ?? false,
            lastPlayedAt: existing?.lastPlayedAt ?? null,
            roundsCompleted: existing?.roundsCompleted ?? 0,
            ...difficulty,
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
