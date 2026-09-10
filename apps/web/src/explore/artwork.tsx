import type { CSSProperties } from "react";

/**
 * Arte original de los objetos de Explorar: formas planas y redondeadas,
 * la misma paleta cálida de tokens.css, dibujadas a mano en SVG (no
 * fotografía, no stock, no emoji) — Product Vision §24. Vive en un único
 * archivo porque cada ícono es pequeño y todos comparten el mismo estilo
 * "pintado plano"; separarlos en 7 archivos no ayudaría a nadie a
 * encontrarlos.
 */

const fill: CSSProperties = { display: "block", width: "100%", height: "100%" };

export function SunArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-sun-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="60%" stopColor="#FFB03B" />
          <stop offset="100%" stopColor="#F58C1F" />
        </radialGradient>
      </defs>
      {[0, 45, 90, 135].map((angle) => (
        <rect
          key={angle}
          x={47}
          y={2}
          width={6}
          height={22}
          rx={3}
          fill="#FFCF6B"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx={50} cy={50} r={26} fill="url(#explore-sun-grad)" />
    </svg>
  );
}

export function CloudArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <linearGradient id="explore-cloud-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8F3FF" />
        </linearGradient>
      </defs>
      <g fill="url(#explore-cloud-grad)">
        <ellipse cx={34} cy={58} rx={22} ry={16} />
        <ellipse cx={60} cy={50} rx={26} ry={20} />
        <ellipse cx={80} cy={60} rx={17} ry={13} />
        <rect x={22} y={56} width={64} height={20} rx={10} />
      </g>
    </svg>
  );
}

export function BirdArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      {/* Colita, a la izquierda y detrás del cuerpo. */}
      <path d="M22 58 Q6 52 8 38 Q22 42 30 56 Z" fill="#4FB89F" />
      {/* Cuerpo, en forma de gota redondeada. */}
      <ellipse cx={48} cy={58} rx={26} ry={19} fill="#6BD6C2" />
      {/* Ala plegada, un tono más oscuro para separarla del cuerpo. */}
      <ellipse cx={44} cy={53} rx={15} ry={10} fill="#4FB89F" transform="rotate(-18 44 53)" />
      {/* Cabeza, superpuesta al cuerpo hacia la derecha. */}
      <circle cx={72} cy={45} r={11} fill="#6BD6C2" />
      <circle cx={76} cy={42} r={2.4} fill="#3A2E22" />
      <path d="M81 46 L92 49 L81 52 Z" fill="#F58C1F" />
      {/* Patitas delgadas. */}
      <path d="M40 76 L36 84 M52 76 L52 85" stroke="#F58C1F" strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function TreeArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-tree-grad" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#8CE6C6" />
          <stop offset="100%" stopColor="#2E9C89" />
        </radialGradient>
      </defs>
      <rect x={44} y={58} width={12} height={34} rx={5} fill="#B98555" />
      <circle cx={50} cy={40} r={34} fill="url(#explore-tree-grad)" />
    </svg>
  );
}

export function ButterflyArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <g>
        <ellipse cx={30} cy={38} rx={22} ry={16} fill="#F58BC0" />
        <ellipse cx={30} cy={64} rx={16} ry={12} fill="#8B7FF5" />
        <ellipse cx={70} cy={38} rx={22} ry={16} fill="#F58BC0" />
        <ellipse cx={70} cy={64} rx={16} ry={12} fill="#8B7FF5" />
      </g>
      <rect x={47} y={28} width={6} height={44} rx={3} fill="#3A2E22" />
      <circle cx={50} cy={26} r={5} fill="#3A2E22" />
    </svg>
  );
}

export function BallArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-ball-grad" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FFD93D" />
          <stop offset="100%" stopColor="#F58C1F" />
        </radialGradient>
      </defs>
      <circle cx={50} cy={50} r={34} fill="url(#explore-ball-grad)" />
      <path d="M50 16 Q66 34 50 50 Q34 66 50 84" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      <path d="M18 42 Q40 50 50 50 Q60 50 82 42" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    </svg>
  );
}

export function FlowerArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <rect x={46} y={55} width={8} height={38} rx={4} fill="#4FB89F" />
      <g fill="#F58BC0">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx={50} cy={28} rx={12} ry={17} transform={`rotate(${angle} 50 42)`} />
        ))}
      </g>
      <circle cx={50} cy={42} r={11} fill="#FFD93D" />
    </svg>
  );
}

/** Hojita suelta para la animación de "caen hojas" del árbol (InteractiveObject). */
export function LeafArt({ color = "#4FB89F" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={fill} aria-hidden="true">
      <path d="M12 2 C20 6 20 18 12 22 C4 18 4 6 12 2 Z" fill={color} />
      <path d="M12 4 L12 20" stroke="#2E7C6C" strokeWidth={1} opacity={0.5} />
    </svg>
  );
}

export const EXPLORE_OBJECT_ART: Record<string, () => JSX.Element> = {
  sun: SunArt,
  cloud: CloudArt,
  bird: BirdArt,
  tree: TreeArt,
  butterfly: ButterflyArt,
  ball: BallArt,
  flower: FlowerArt,
};
