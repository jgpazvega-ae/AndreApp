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
      <defs>
        <radialGradient id="explore-bird-grad" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#A8ECD9" />
          <stop offset="100%" stopColor="#6BD6C2" />
        </radialGradient>
      </defs>
      {/* Colita, a la izquierda y detrás del cuerpo. */}
      <path d="M22 58 Q6 52 8 38 Q22 42 30 56 Z" fill="#4FB89F" />
      {/* Cuerpo, en forma de gota redondeada. */}
      <ellipse cx={48} cy={58} rx={26} ry={19} fill="url(#explore-bird-grad)" />
      {/* Ala plegada, un tono más oscuro para separarla del cuerpo. */}
      <ellipse cx={44} cy={53} rx={15} ry={10} fill="#4FB89F" transform="rotate(-18 44 53)" />
      {/* Cabeza, superpuesta al cuerpo hacia la derecha. */}
      <circle cx={72} cy={45} r={11} fill="url(#explore-bird-grad)" />
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
      <defs>
        <radialGradient id="explore-butterfly-pink" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFC2E2" />
          <stop offset="100%" stopColor="#F58BC0" />
        </radialGradient>
        <radialGradient id="explore-butterfly-purple" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#B0A8FF" />
          <stop offset="100%" stopColor="#8B7FF5" />
        </radialGradient>
      </defs>
      <g>
        <ellipse cx={30} cy={38} rx={22} ry={16} fill="url(#explore-butterfly-pink)" />
        <ellipse cx={30} cy={64} rx={16} ry={12} fill="url(#explore-butterfly-purple)" />
        <ellipse cx={70} cy={38} rx={22} ry={16} fill="url(#explore-butterfly-pink)" />
        <ellipse cx={70} cy={64} rx={16} ry={12} fill="url(#explore-butterfly-purple)" />
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
      <path
        d="M50 16 Q66 34 50 50 Q34 66 50 84"
        fill="none"
        stroke="#fff"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.75}
      />
      <path
        d="M18 42 Q40 50 50 50 Q60 50 82 42"
        fill="none"
        stroke="#fff"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.6}
      />
    </svg>
  );
}

export function FlowerArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-flower-petal" cx="50%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FFC2E2" />
          <stop offset="100%" stopColor="#F58BC0" />
        </radialGradient>
        <radialGradient id="explore-flower-center" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFEB9C" />
          <stop offset="100%" stopColor="#FFD93D" />
        </radialGradient>
      </defs>
      <rect x={46} y={55} width={8} height={38} rx={4} fill="#4FB89F" />
      <g fill="url(#explore-flower-petal)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx={50} cy={28} rx={12} ry={17} transform={`rotate(${angle} 50 42)`} />
        ))}
      </g>
      <circle cx={50} cy={42} r={11} fill="url(#explore-flower-center)" />
    </svg>
  );
}

export function KiteArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-kite-grad" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#B0A8FF" />
          <stop offset="100%" stopColor="#8B7FF5" />
        </radialGradient>
      </defs>
      <path d="M50 6 L82 42 L50 60 L18 42 Z" fill="url(#explore-kite-grad)" />
      <path d="M50 6 L82 42 L50 60 Z" fill="#6B5FE0" />
      <path d="M50 6 L50 60 M18 42 L82 42" stroke="#3A2E22" strokeWidth={1.5} opacity={0.35} />
      <path d="M50 60 Q46 74 50 86 Q54 96 50 100" fill="none" stroke="#3A2E22" strokeWidth={2} opacity={0.5} />
      {[70, 84, 96].map((y, i) => (
        <path
          key={y}
          d={`M${48 - i} ${y} Q50 ${y + 6} ${52 + i} ${y} Q50 ${y - 4} ${48 - i} ${y} Z`}
          fill={i % 2 === 0 ? "#F58BC0" : "#FFD93D"}
        />
      ))}
    </svg>
  );
}

export function PuddleArt() {
  return (
    <svg viewBox="0 0 100 60" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-puddle-grad" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#BEE3FF" />
          <stop offset="100%" stopColor="#6FAEE0" />
        </radialGradient>
      </defs>
      <ellipse cx={50} cy={34} rx={44} ry={16} fill="url(#explore-puddle-grad)" />
      <ellipse cx={38} cy={28} rx={12} ry={4} fill="#EAF6FF" opacity={0.7} />
    </svg>
  );
}

/** Anillo suelto para la ondulación del charco al tocarlo (InteractiveObject). */
export function RippleArt() {
  return (
    <svg viewBox="0 0 40 40" style={fill} aria-hidden="true">
      <ellipse cx={20} cy={20} rx={18} ry={7} fill="none" stroke="#EAF6FF" strokeWidth={2.5} opacity={0.85} />
    </svg>
  );
}

export function FountainArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-fountain-water" cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#BEE3FF" />
          <stop offset="100%" stopColor="#6FAEE0" />
        </radialGradient>
      </defs>
      <ellipse cx={50} cy={78} rx={38} ry={12} fill="#C9BFB0" />
      <ellipse cx={50} cy={74} rx={32} ry={9} fill="#E4DCCF" />
      <ellipse cx={50} cy={73} rx={26} ry={6} fill="url(#explore-fountain-water)" />
      <rect x={46} y={40} width={8} height={34} rx={4} fill="#C9BFB0" />
      <path d="M50 10 Q56 30 50 44 Q44 30 50 10 Z" fill="url(#explore-fountain-water)" opacity={0.9} />
      <circle cx={38} cy={26} r={4} fill="#BEE3FF" opacity={0.8} />
      <circle cx={64} cy={30} r={3.5} fill="#BEE3FF" opacity={0.8} />
    </svg>
  );
}

export function FrogArt() {
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-frog-grad" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#B6E85C" />
          <stop offset="100%" stopColor="#7FB939" />
        </radialGradient>
      </defs>
      {/* Patas traseras, dobladas (en cuclillas, lista para saltar). */}
      <ellipse cx={26} cy={78} rx={14} ry={9} fill="#7FB939" transform="rotate(-20 26 78)" />
      <ellipse cx={74} cy={78} rx={14} ry={9} fill="#7FB939" transform="rotate(20 74 78)" />
      {/* Cuerpo. */}
      <ellipse cx={50} cy={62} rx={34} ry={26} fill="url(#explore-frog-grad)" />
      {/* Ojos saltones, arriba del cuerpo. */}
      <circle cx={34} cy={38} r={13} fill="url(#explore-frog-grad)" />
      <circle cx={66} cy={38} r={13} fill="url(#explore-frog-grad)" />
      <circle cx={34} cy={36} r={6.5} fill="#3A2E22" />
      <circle cx={66} cy={36} r={6.5} fill="#3A2E22" />
      <circle cx={36} cy={34} r={1.8} fill="#fff" />
      <circle cx={68} cy={34} r={1.8} fill="#fff" />
      {/* Sonrisa. */}
      <path d="M32 66 Q50 76 68 66" fill="none" stroke="#3A2E22" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

/** Columpio completo (Product Vision — interacción de arrastre): un juego de
 * columpio con su propia estructura en A a cada lado y travesaño arriba, no
 * cuerdas sueltas que "se pierden" en la nada — se lee como completo sin
 * depender de nada fuera de su propio recuadro. */
export function SwingArt() {
  return (
    <svg viewBox="0 0 100 140" style={fill} aria-hidden="true">
      <path d="M12 10 L4 130 M12 10 L20 130" stroke="#B98555" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M88 10 L96 130 M88 10 L80 130" stroke="#B98555" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M12 10 L88 10" stroke="#96714A" strokeWidth={6} strokeLinecap="round" />
      <path d="M36 10 L36 92" stroke="#8A6642" strokeWidth={3} strokeLinecap="round" />
      <path d="M64 10 L64 92" stroke="#8A6642" strokeWidth={3} strokeLinecap="round" />
      <rect x={26} y={90} width={48} height={12} rx={6} fill="#E0912A" />
      <rect x={26} y={90} width={48} height={5} rx={2.5} fill="#FFB03B" />
    </svg>
  );
}

export function BenchArt() {
  return (
    <svg viewBox="0 0 100 70" style={fill} aria-hidden="true">
      <defs>
        <linearGradient id="explore-bench-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9A968" />
          <stop offset="100%" stopColor="#B98555" />
        </linearGradient>
      </defs>
      {/* Patas. */}
      <rect x={8} y={40} width={6} height={26} rx={2} fill="#8C6A44" />
      <rect x={86} y={40} width={6} height={26} rx={2} fill="#8C6A44" />
      {/* Respaldo. */}
      <rect x={10} y={6} width={80} height={10} rx={3} fill="url(#explore-bench-wood)" />
      <rect x={10} y={20} width={80} height={10} rx={3} fill="url(#explore-bench-wood)" />
      {/* Asiento. */}
      <rect x={4} y={36} width={92} height={11} rx={3} fill="url(#explore-bench-wood)" />
    </svg>
  );
}

/** Matita de pasto camuflada entre la decoración — uno de los descubrimientos
 * sin explicar (Product Vision — curiosity design). */
export function GrassArt() {
  return (
    <svg viewBox="0 0 60 60" style={fill} aria-hidden="true">
      {[
        { x: 14, rot: -14, h: 34 },
        { x: 24, rot: -4, h: 42 },
        { x: 34, rot: 6, h: 40 },
        { x: 44, rot: 16, h: 30 },
      ].map((blade) => (
        <path
          key={blade.x}
          d={`M${blade.x} 58 Q${blade.x - 4} ${58 - blade.h * 0.6} ${blade.x} ${58 - blade.h}`}
          fill="none"
          stroke="#4FB89F"
          strokeWidth={4}
          strokeLinecap="round"
          transform={`rotate(${blade.rot} ${blade.x} 58)`}
        />
      ))}
    </svg>
  );
}

/** Piedrita camuflada — otro descubrimiento sin explicar. */
export function StoneArt() {
  return (
    <svg viewBox="0 0 60 40" style={fill} aria-hidden="true">
      <defs>
        <radialGradient id="explore-stone-grad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#C9BFB0" />
          <stop offset="100%" stopColor="#9B8E7B" />
        </radialGradient>
      </defs>
      <ellipse cx={30} cy={26} rx={26} ry={13} fill="url(#explore-stone-grad)" />
      <ellipse cx={14} cy={30} rx={11} ry={7} fill="url(#explore-stone-grad)" />
    </svg>
  );
}

/** Chispita suelta para la matita de pasto al tocarla (InteractiveObject). */
export function SparkleArt() {
  return (
    <svg viewBox="0 0 24 24" style={fill} aria-hidden="true">
      <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" fill="#FFD93D" />
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
  kite: KiteArt,
  puddle: PuddleArt,
  fountain: FountainArt,
  frog: FrogArt,
  swing: SwingArt,
  bench: BenchArt,
  grass: GrassArt,
  stone: StoneArt,
};
