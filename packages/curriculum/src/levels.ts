import type { CurriculumLevel } from "./types";

/**
 * Catálogo declarativo de los 22 niveles del currículo.
 * Fuente de verdad pedagógica: ../../../docs/CURRICULUM.md §4.
 *
 * "free" sigue el empaquetado comercial de PLAN.md §3: Etapa A completa
 * + una muestra de la Etapa B (N4).
 */
export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  // Etapa A — Descubrimiento (gratis, uso acompañado)
  { id: "n1", order: 1, stage: "A", domain: "attention", titleKey: "level.n1.title", icon: "✨", free: true, status: "playable" },
  { id: "n2", order: 2, stage: "A", domain: "attention", titleKey: "level.n2.title", icon: "🎯", free: true, status: "playable" },
  { id: "n3", order: 3, stage: "A", domain: "perception", titleKey: "level.n3.title", icon: "🧩", free: true, status: "playable" },

  // Etapa B — Exploración (muestra gratis: N4; resto de pago)
  { id: "n4", order: 4, stage: "B", domain: "categorization", titleKey: "level.n4.title", icon: "🟥", free: true, status: "playable" },
  { id: "n5", order: 5, stage: "B", domain: "language", titleKey: "level.n5.title", icon: "🐶", free: false, status: "coming-soon" },
  { id: "n6", order: 6, stage: "B", domain: "spatial", titleKey: "level.n6.title", icon: "🧩", free: false, status: "coming-soon" },
  { id: "n7", order: 7, stage: "B", domain: "language", axis: "social-emotional", titleKey: "level.n7.title", icon: "😊", free: false, status: "coming-soon" },
  { id: "n8", order: 8, stage: "B", domain: "attention", axis: "executive-function", titleKey: "level.n8.title", icon: "🛑", free: false, status: "coming-soon" },

  // Etapa C — Fundamentos (de pago)
  { id: "n9", order: 9, stage: "C", domain: "number", titleKey: "level.n9.title", icon: "🔢", free: false, status: "coming-soon" },
  { id: "n10", order: 10, stage: "C", domain: "number", titleKey: "level.n10.title", icon: "1️⃣", free: false, status: "coming-soon" },
  { id: "n11", order: 11, stage: "C", domain: "number", titleKey: "level.n11.title", icon: "🔟", free: false, status: "coming-soon" },
  { id: "n12", order: 12, stage: "C", domain: "shapes", titleKey: "level.n12.title", icon: "🔺", free: false, status: "coming-soon" },
  { id: "n13", order: 13, stage: "C", domain: "memory", axis: "executive-function", titleKey: "level.n13.title", icon: "🧠", free: false, status: "coming-soon" },
  { id: "n14", order: 14, stage: "C", domain: "language", titleKey: "level.n14.title", icon: "🎵", free: false, status: "coming-soon" },
  { id: "n15", order: 15, stage: "C", domain: "spatial", axis: "social-emotional", titleKey: "level.n15.title", icon: "📏", free: false, status: "coming-soon" },
  { id: "n16", order: 16, stage: "C", domain: "motor", titleKey: "level.n16.title", icon: "✏️", free: false, status: "coming-soon" },

  // Etapa D — Preescolar (de pago)
  { id: "n17", order: 17, stage: "D", domain: "number", titleKey: "level.n17.title", icon: "2️⃣", free: false, status: "coming-soon" },
  { id: "n18", order: 18, stage: "D", domain: "number", titleKey: "level.n18.title", icon: "➕", free: false, status: "coming-soon" },
  { id: "n19", order: 19, stage: "D", domain: "categorization", axis: "executive-function", titleKey: "level.n19.title", icon: "🔄", free: false, status: "coming-soon" },
  { id: "n20", order: 20, stage: "D", domain: "reading", titleKey: "level.n20.title", icon: "🔤", free: false, status: "coming-soon" },
  { id: "n21", order: 21, stage: "D", domain: "motor", titleKey: "level.n21.title", icon: "📝", free: false, status: "coming-soon" },
  { id: "n22", order: 22, stage: "D", domain: "reading", titleKey: "level.n22.title", icon: "📖", free: false, status: "coming-soon" },
];

export function getLevel(id: string): CurriculumLevel | undefined {
  return CURRICULUM_LEVELS.find((level) => level.id === id);
}

export function getLevelsByStage(stage: CurriculumLevel["stage"]): CurriculumLevel[] {
  return CURRICULUM_LEVELS.filter((level) => level.stage === stage).sort((a, b) => a.order - b.order);
}
