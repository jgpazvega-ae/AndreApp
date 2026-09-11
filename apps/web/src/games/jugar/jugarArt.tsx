import type { CSSProperties } from "react";

/**
 * Arte original compartido por la biblioteca de Jugar: mismo lenguaje
 * visual que explore/artwork.tsx (formas planas, gradientes radiales
 * suaves, sin fotografía ni emoji como protagonista) para que un juego
 * nuevo no se sienta "pegado de otra app" (Product Vision §12/§32).
 */

const fill: CSSProperties = { display: "block", width: "100%", height: "100%" };
const OUTLINE = "#3A2E22";

export function BubbleArt({ color }: { color: string }) {
  const gradId = `bubble-grad-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
          <stop offset="35%" stopColor={color} stopOpacity={0.55} />
          <stop offset="100%" stopColor={color} stopOpacity={0.85} />
        </radialGradient>
      </defs>
      <circle cx={50} cy={50} r={44} fill={`url(#${gradId})`} stroke={color} strokeWidth={2} opacity={0.95} />
      <ellipse cx={35} cy={32} rx={12} ry={7} fill="#fff" opacity={0.75} transform="rotate(-25 35 32)" />
    </svg>
  );
}

export function StarArt({ color = "#FFD93D" }: { color?: string }) {
  const gradId = `star-grad-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        {/* Resalte BLANCO (no un tono fijo): si el 0% del degradado fuera
            siempre amarillo pálido, una estrella "morada" se vería dorada —
            justo el bug que rompía la discriminación de color en Colores
            Mágicos (StarArt se reutiliza ahí como forma genérica). */}
        <radialGradient id={gradId} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <path
        d="M50 6 L61 37 L94 38 L67 58 L77 90 L50 71 L23 90 L33 58 L6 38 L39 37 Z"
        fill={`url(#${gradId})`}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartArt({ color = "#F58BC0" }: { color?: string }) {
  const gradId = `heart-grad-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.8} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <path
        d="M50 88 C20 64 6 46 6 28 C6 12 18 4 30 4 C40 4 47 10 50 18 C53 10 60 4 70 4 C82 4 94 12 94 28 C94 46 80 64 50 88 Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}

export function CircleShapeArt({ color = "#7EC8F0" }: { color?: string }) {
  // Id del degradado incluye el color: si dos círculos de colores distintos
  // se muestran a la vez (Colores Mágicos) con el mismo id fijo, el navegador
  // resuelve #jugar-circle-grad UNA sola vez para todo el documento — todos
  // los círculos se pintarían del color del PRIMERO. Mismo bug que StarArt.
  const gradId = `circle-grad-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.6} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <circle cx={50} cy={50} r={42} fill={`url(#${gradId})`} />
    </svg>
  );
}

/** Perrito: orejas caídas, lengua afuera — mismo estilo que el resto del mundo. */
export function DogArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-dog-grad" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#E8C79A" />
          <stop offset="100%" stopColor="#C7935A" />
        </radialGradient>
      </defs>
      <path d="M22 34 Q14 55 26 62 Q34 50 32 34 Z" fill="url(#jugar-dog-grad)" />
      <path d="M78 34 Q86 55 74 62 Q66 50 68 34 Z" fill="url(#jugar-dog-grad)" />
      <circle cx={50} cy={48} r={30} fill="url(#jugar-dog-grad)" />
      <ellipse cx={50} cy={62} rx={15} ry={12} fill="#FFF3DC" />
      <circle cx={40} cy={44} r={4.5} fill={OUTLINE} />
      <circle cx={60} cy={44} r={4.5} fill={OUTLINE} />
      <ellipse cx={50} cy={58} rx={5} ry={3.6} fill={OUTLINE} />
      <path d="M42 68 Q50 74 58 68" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <ellipse cx={50} cy={74} rx={4} ry={7} fill="#F58BC0" />
    </svg>
  );
}

/** Gatito: orejas puntiagudas, bigotes. */
export function CatArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-cat-grad" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFC98A" />
          <stop offset="100%" stopColor="#E88E3E" />
        </radialGradient>
      </defs>
      <path d="M28 30 L20 8 L40 22 Z" fill="url(#jugar-cat-grad)" />
      <path d="M72 30 L80 8 L60 22 Z" fill="url(#jugar-cat-grad)" />
      <circle cx={50} cy={48} r={29} fill="url(#jugar-cat-grad)" />
      <circle cx={40} cy={44} r={4.2} fill={OUTLINE} />
      <circle cx={60} cy={44} r={4.2} fill={OUTLINE} />
      <path d="M46 56 L50 60 L54 56" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path
        d="M28 56 L10 52 M28 60 L10 60 M72 56 L90 52 M72 60 L90 60"
        stroke={OUTLINE}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Vaquita: manchas negras, cuernitos. */
export function CowArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-cow-grad" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDEAE4" />
        </radialGradient>
      </defs>
      <path d="M36 20 Q30 8 24 16 Q30 24 36 26 Z" fill="#EDEAE4" />
      <path d="M64 20 Q70 8 76 16 Q70 24 64 26 Z" fill="#EDEAE4" />
      <path d="M22 34 Q14 50 26 58 Q34 48 32 34 Z" fill="url(#jugar-cow-grad)" />
      <path d="M78 34 Q86 50 74 58 Q66 48 68 34 Z" fill="url(#jugar-cow-grad)" />
      <circle cx={50} cy={50} r={30} fill="url(#jugar-cow-grad)" />
      <ellipse cx={34} cy={40} rx={9} ry={11} fill="#2B241E" opacity={0.85} />
      <ellipse cx={64} cy={58} rx={7} ry={9} fill="#2B241E" opacity={0.85} />
      <ellipse cx={50} cy={64} rx={16} ry={12} fill="#FFDDE0" />
      <circle cx={41} cy={46} r={4} fill={OUTLINE} />
      <circle cx={59} cy={46} r={4} fill={OUTLINE} />
      <circle cx={44} cy={64} r={2.6} fill={OUTLINE} />
      <circle cx={56} cy={64} r={2.6} fill={OUTLINE} />
    </svg>
  );
}

/** Patito: pico naranja, alitas. */
export function DuckArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-duck-grad" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#FFF3A0" />
          <stop offset="100%" stopColor="#FFD93D" />
        </radialGradient>
      </defs>
      <ellipse cx={50} cy={64} rx={34} ry={26} fill="url(#jugar-duck-grad)" />
      <circle cx={62} cy={34} r={22} fill="url(#jugar-duck-grad)" />
      <path d="M80 36 L96 32 L96 44 Z" fill="#F58C1F" />
      <circle cx={68} cy={28} r={3.6} fill={OUTLINE} />
      <ellipse cx={30} cy={62} rx={13} ry={9} fill="#F5C542" transform="rotate(-15 30 62)" />
    </svg>
  );
}

/** Conejo: orejas largas, moflete. */
export function RabbitArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-rabbit-grad" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#FFF6EE" />
          <stop offset="100%" stopColor="#EAD9C8" />
        </radialGradient>
      </defs>
      <ellipse cx={38} cy={22} rx={9} ry={26} fill="url(#jugar-rabbit-grad)" />
      <ellipse cx={62} cy={22} rx={9} ry={26} fill="url(#jugar-rabbit-grad)" />
      <ellipse cx={38} cy={22} rx={4.5} ry={18} fill="#F5C6D6" />
      <ellipse cx={62} cy={22} rx={4.5} ry={18} fill="#F5C6D6" />
      <circle cx={50} cy={58} r={30} fill="url(#jugar-rabbit-grad)" />
      <circle cx={41} cy={54} r={4} fill={OUTLINE} />
      <circle cx={59} cy={54} r={4} fill={OUTLINE} />
      <ellipse cx={50} cy={64} rx={4.4} ry={3.2} fill="#F58BC0" />
      <path d="M44 70 Q50 75 56 70" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Zanahoria. */
export function CarrotArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-carrot-grad" cx="35%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#FFB86B" />
          <stop offset="100%" stopColor="#F0761E" />
        </radialGradient>
      </defs>
      <path d="M50 90 L30 34 Q50 22 70 34 Z" fill="url(#jugar-carrot-grad)" />
      <path
        d="M42 30 Q40 14 32 8 M50 26 Q50 10 50 4 M58 30 Q60 14 68 8"
        stroke="#3FA66A"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Manzana. */
export function AppleArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-apple-grad" cx="35%" cy="25%" r="78%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="100%" stopColor="#E0392B" />
        </radialGradient>
      </defs>
      <path d="M50 14 Q56 4 66 8" stroke="#6B4A2A" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path
        d="M50 24 C24 24 14 46 20 66 C25 82 38 92 50 92 C62 92 75 82 80 66 C86 46 76 24 50 24 Z"
        fill="url(#jugar-apple-grad)"
      />
      <ellipse cx={36} cy={42} rx={9} ry={14} fill="#fff" opacity={0.35} />
    </svg>
  );
}

/** Pescadito para el bloque submarino / relleno de variedad. */
export function IceCreamArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-icecream-grad" cx="35%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#FFD9EC" />
          <stop offset="100%" stopColor="#F58BC0" />
        </radialGradient>
      </defs>
      <circle cx={50} cy={34} r={24} fill="url(#jugar-icecream-grad)" />
      <path d="M32 40 L50 92 L68 40 Z" fill="#E8C79A" />
      <path d="M34 42 L50 84 L66 42" stroke="#C7935A" strokeWidth={2} fill="none" opacity={0.5} />
    </svg>
  );
}

/** Pizza (rebanada). */
export function PizzaArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="jugar-pizza-grad" cx="35%" cy="20%" r="85%">
          <stop offset="0%" stopColor="#FFE29A" />
          <stop offset="100%" stopColor="#F5C542" />
        </radialGradient>
      </defs>
      <path d="M50 10 L88 88 L12 88 Z" fill="url(#jugar-pizza-grad)" />
      <path d="M50 22 L78 80 L22 80 Z" fill="#F0761E" opacity={0.4} />
      <circle cx={50} cy={44} r={6} fill="#E0392B" />
      <circle cx={38} cy={62} r={5} fill="#E0392B" />
      <circle cx={62} cy={64} r={5.5} fill="#E0392B" />
    </svg>
  );
}
