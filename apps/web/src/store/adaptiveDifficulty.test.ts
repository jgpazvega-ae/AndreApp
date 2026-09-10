import { describe, expect, it } from "vitest";
import {
  BASE_DIFFICULTY,
  EASY_STREAK_TO_LEVEL_UP,
  STRUGGLE_STREAK_TO_LEVEL_DOWN,
  nextDifficultyState,
} from "./adaptiveDifficulty";

function playOutcomes(outcomes: boolean[]) {
  return outcomes.reduce((state, correct) => nextDifficultyState(state, correct), BASE_DIFFICULTY);
}

describe("dificultad adaptativa (nextDifficultyState)", () => {
  it("empieza en el nivel 1", () => {
    expect(BASE_DIFFICULTY).toEqual({ difficultyLevel: 1, easyStreak: 0, struggleStreak: 0 });
  });

  it(`sube a nivel 2 tras ${EASY_STREAK_TO_LEVEL_UP} aciertos seguidos, y reinicia la racha`, () => {
    const state = playOutcomes(Array(EASY_STREAK_TO_LEVEL_UP).fill(true));
    expect(state).toEqual({ difficultyLevel: 2, easyStreak: 0, struggleStreak: 0 });
  });

  it("no sube un acierto antes de completar la racha", () => {
    const state = playOutcomes(Array(EASY_STREAK_TO_LEVEL_UP - 1).fill(true));
    expect(state.difficultyLevel).toBe(1);
    expect(state.easyStreak).toBe(EASY_STREAK_TO_LEVEL_UP - 1);
  });

  it("un intento con ayuda corta la racha fácil sin bajar el nivel", () => {
    const state = playOutcomes([...Array(EASY_STREAK_TO_LEVEL_UP - 1).fill(true), false]);
    expect(state).toEqual({ difficultyLevel: 1, easyStreak: 0, struggleStreak: 1 });
  });

  it(`baja de nivel tras ${STRUGGLE_STREAK_TO_LEVEL_DOWN} intentos con ayuda seguidos (más rápido que sube)`, () => {
    const up = playOutcomes(Array(EASY_STREAK_TO_LEVEL_UP).fill(true)); // nivel 2
    const down = [...Array(STRUGGLE_STREAK_TO_LEVEL_DOWN).fill(false)].reduce(
      (state: typeof up, correct) => nextDifficultyState(state, correct),
      up,
    );
    expect(down).toEqual({ difficultyLevel: 1, easyStreak: 0, struggleStreak: 0 });
  });

  it("nunca baja de 1", () => {
    const state = playOutcomes(Array(20).fill(false));
    expect(state.difficultyLevel).toBe(1);
  });

  it("nunca sube de 3", () => {
    const state = playOutcomes(Array(50).fill(true));
    expect(state.difficultyLevel).toBe(3);
  });

  it("un acierto reinicia la racha de esfuerzo", () => {
    const state = playOutcomes([false, false, true]);
    expect(state).toEqual({ difficultyLevel: 1, easyStreak: 1, struggleStreak: 0 });
  });
});
