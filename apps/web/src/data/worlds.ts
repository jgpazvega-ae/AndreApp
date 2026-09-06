import type { WorldId } from "@andreapp/curriculum";
import type { BuddyId } from "./buddies";

export interface World {
  id: WorldId;
  nameKey: string;
  icon: string;
  gradient: [string, string];
  /** El compañero que recibe al niño en este mundo (Blueprint v1 §"Arquitectura de mundos"). */
  hostBuddy: BuddyId;
}

export const WORLDS: [World, World, World] = [
  { id: "estacion", nameKey: "world.estacion.name", icon: "🚂", gradient: ["#FFC46B", "#E0912A"], hostBuddy: "dante" },
  { id: "bosque", nameKey: "world.bosque.name", icon: "🌲", gradient: ["#6BD6C2", "#2E9C89"], hostBuddy: "odie" },
  { id: "oceano", nameKey: "world.oceano.name", icon: "🌊", gradient: ["#7EC8F0", "#2E6FE0"], hostBuddy: "kira" },
];

export function getWorld(id: WorldId): World {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}
