import type { CSSProperties } from "react";
import type { BuddyId } from "../data/buddies";

/**
 * Arte original de los 3 perritos, en el MISMO lenguaje visual que el resto
 * del mundo (explore/artwork.tsx): formas planas y redondeadas, gradientes
 * radiales suaves (luz arriba-izquierda), sin textura de pelo fotográfica.
 *
 * Antes cada perrito era una ilustración pintada hiperrealista (foto de las
 * mascotas reales de la familia, con pelaje detallado) — un lenguaje visual
 * completamente distinto al del Parque, la incoherencia P0 más visible de
 * la app (el "personaje" parecía pegado de otra aplicación). Este archivo
 * los rediseña conservando lo que los hace reconocibles (color de pelaje,
 * orejas, tamaño relativo, carácter) pero dibujados como el resto del
 * mundo: mismo tratamiento de "profundidad suave", mismo trazo, misma
 * paleta cálida de tokens.css.
 */

const fill: CSSProperties = { display: "block", width: "100%", height: "100%" };
const OUTLINE = "#3A2E22";

function OdieArt() {
  // Terrier negro con reflejos rojizos, orejas paradas, cejas marcadas
  // (juguetón pero un poco mandón — Odie nunca está del todo quieto).
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true" data-buddy-id="odie">
      <defs>
        <radialGradient id="buddy-odie-body" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5C4E42" />
          <stop offset="100%" stopColor="#2B241E" />
        </radialGradient>
        <radialGradient id="buddy-odie-accent" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#C97A45" />
          <stop offset="100%" stopColor="#9C5A2E" />
        </radialGradient>
      </defs>
      {/* Cola, curvada detrás del cuerpo. */}
      <path d="M18 66 Q4 56 10 42 Q22 46 24 62 Z" fill="url(#buddy-odie-accent)" />
      {/* Patitas delanteras. */}
      <ellipse cx={38} cy={92} rx={9} ry={7} fill="url(#buddy-odie-body)" />
      <ellipse cx={64} cy={92} rx={9} ry={7} fill="url(#buddy-odie-body)" />
      {/* Cuerpo. */}
      <ellipse cx={50} cy={76} rx={28} ry={21} fill="url(#buddy-odie-body)" />
      {/* Pechera rojiza. */}
      <ellipse cx={50} cy={84} rx={13} ry={14} fill="url(#buddy-odie-accent)" />
      {/* Orejas, puntiagudas y paradas — de terrier, no redondas. */}
      <path d="M25 32 L18 4 L38 20 Z" fill="url(#buddy-odie-body)" />
      <path d="M77 32 L84 4 L64 20 Z" fill="url(#buddy-odie-body)" />
      <path d="M27 27 L23 11 L36 19 Z" fill="url(#buddy-odie-accent)" />
      <path d="M75 27 L79 11 L66 19 Z" fill="url(#buddy-odie-accent)" />
      {/* Cabeza. */}
      <circle cx={51} cy={40} r={23} fill="url(#buddy-odie-body)" />
      {/* Hocico: SOBRESALE del círculo de la cabeza (no un parche al ras) —
          es lo que hace que se lea como hocico de perro y no cara de oso. */}
      <ellipse cx={51} cy={58} rx={14} ry={13} fill="url(#buddy-odie-accent)" />
      {/* Cejas: marcadas y ligeramente hacia adentro — el aire "mandón". */}
      <path d="M35 33 Q40 29 45 32" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M57 32 Q62 29 67 33" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" fill="none" />
      {/* Ojos. */}
      <circle cx={41} cy={40} r={4.2} fill={OUTLINE} />
      <circle cx={61} cy={40} r={4.2} fill={OUTLINE} />
      <circle cx={42.2} cy={38.6} r={1.3} fill="#fff" />
      <circle cx={62.2} cy={38.6} r={1.3} fill="#fff" />
      {/* Nariz, en la punta del hocico. */}
      <ellipse cx={51} cy={54} rx={4.8} ry={3.4} fill={OUTLINE} />
      {/* Boca, entreabierta — juguetón. */}
      <path d="M44 63 Q51 68 58 63" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DanteArt() {
  // Schnauzer gris con barba y cejas color crema, orejas caídas, mirada
  // tranquila — el mayor, más grande y calmado que los otros dos.
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true" data-buddy-id="dante">
      <defs>
        <radialGradient id="buddy-dante-body" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#98A2AC" />
          <stop offset="100%" stopColor="#606B74" />
        </radialGradient>
        <radialGradient id="buddy-dante-accent" cx="40%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FFF3DC" />
          <stop offset="100%" stopColor="#E8D3A8" />
        </radialGradient>
      </defs>
      {/* Cola corta, pegada al cuerpo (no un apéndice suelto que se confunda con un brazo). */}
      <path d="M74 68 Q88 62 86 48 Q76 50 72 64 Z" fill="url(#buddy-dante-body)" />
      {/* Patitas, color crema (igual que las piernas de un schnauzer real). */}
      <ellipse cx={36} cy={93} rx={9} ry={7} fill="url(#buddy-dante-accent)" />
      <ellipse cx={65} cy={93} rx={9} ry={7} fill="url(#buddy-dante-accent)" />
      {/* Cuerpo, más grande — es el mayor y el más protector. */}
      <ellipse cx={50} cy={78} rx={29} ry={20} fill="url(#buddy-dante-body)" />
      <ellipse cx={50} cy={88} rx={12} ry={10} fill="url(#buddy-dante-accent)" />
      {/* Orejas caídas, rectangulares y suaves. */}
      <path d="M27 28 Q21 48 31 56 Q39 46 37 28 Z" fill="url(#buddy-dante-body)" />
      <path d="M73 28 Q79 48 69 56 Q61 46 63 28 Z" fill="url(#buddy-dante-body)" />
      {/* Cabeza. */}
      <circle cx={50} cy={40} r={23} fill="url(#buddy-dante-body)" />
      {/* Hocico/barba: SOBRESALE del círculo de la cabeza, igual que el
          hocico de Odie — es la misma pieza que se lee como "barba" por su
          color crema, no una forma aparte que compita con ella. */}
      <ellipse cx={50} cy={58} rx={15} ry={14} fill="url(#buddy-dante-accent)" />
      {/* Cejas crema, características del schnauzer — pegadas arriba de los ojos. */}
      <ellipse cx={41} cy={33} rx={5.2} ry={2.8} fill="url(#buddy-dante-accent)" transform="rotate(-10 41 33)" />
      <ellipse cx={59} cy={33} rx={5.2} ry={2.8} fill="url(#buddy-dante-accent)" transform="rotate(10 59 33)" />
      {/* Ojos, un poco entrecerrados — mirada calmada. */}
      <circle cx={41} cy={40} r={3.8} fill={OUTLINE} />
      <circle cx={59} cy={40} r={3.8} fill={OUTLINE} />
      {/* Nariz, en la punta del hocico. */}
      <ellipse cx={50} cy={55} rx={4.6} ry={3.4} fill={OUTLINE} />
      {/* Boca cerrada, contenta pero serena. */}
      <path d="M43 63 Q50 65 57 63" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

function KiraArt() {
  // Perrita crema/blanca, orejas grandes y caídas, boca abierta feliz —
  // consentida, lista, brinca muchísimo (por eso siempre está a media
  // altura de un salto, ver buddyMotion.ts).
  return (
    <svg viewBox="0 0 100 100" style={fill} aria-hidden="true" data-buddy-id="kira">
      <defs>
        <radialGradient id="buddy-kira-body" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#FFF8EC" />
          <stop offset="100%" stopColor="#FBE3B8" />
        </radialGradient>
        <radialGradient id="buddy-kira-accent" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FFC2E2" />
          <stop offset="100%" stopColor="#F58BC0" />
        </radialGradient>
      </defs>
      {/* Cola, curvada hacia arriba — siempre en movimiento. */}
      <path d="M78 68 Q94 60 90 44 Q78 48 74 64 Z" fill="url(#buddy-kira-body)" />
      {/* Patitas, una un poco más alta — a media brincadera. */}
      <ellipse cx={37} cy={92} rx={8.5} ry={6.5} fill="url(#buddy-kira-body)" />
      <ellipse cx={63} cy={88} rx={8.5} ry={6.5} fill="url(#buddy-kira-body)" />
      {/* Cuerpo, el más pequeño de los tres. */}
      <ellipse cx={50} cy={76} rx={25} ry={19} fill="url(#buddy-kira-body)" />
      {/* Orejas grandes y caídas, orejas fluffy con doble óvalo. */}
      <ellipse cx={24} cy={40} rx={13} ry={20} fill="url(#buddy-kira-body)" transform="rotate(-18 24 40)" />
      <ellipse cx={76} cy={40} rx={13} ry={20} fill="url(#buddy-kira-body)" transform="rotate(18 76 40)" />
      <ellipse
        cx={25}
        cy={42}
        rx={7}
        ry={13}
        fill="url(#buddy-kira-accent)"
        transform="rotate(-18 25 42)"
        opacity={0.55}
      />
      <ellipse
        cx={75}
        cy={42}
        rx={7}
        ry={13}
        fill="url(#buddy-kira-accent)"
        transform="rotate(18 75 42)"
        opacity={0.55}
      />
      {/* Cabeza, un poco más arriba — energía de brinco. */}
      <circle cx={50} cy={39} r={23} fill="url(#buddy-kira-body)" />
      {/* Ojos grandes y brillantes. */}
      <circle cx={41} cy={38} r={5} fill={OUTLINE} />
      <circle cx={59} cy={38} r={5} fill={OUTLINE} />
      <circle cx={42.6} cy={36.2} r={1.7} fill="#fff" />
      <circle cx={60.6} cy={36.2} r={1.7} fill="#fff" />
      {/* Nariz. */}
      <ellipse cx={50} cy={46} rx={4.2} ry={3.2} fill={OUTLINE} />
      {/* Boca abierta, feliz, con lengüita. */}
      <path d="M40 51 Q50 62 60 51 Q50 58 40 51 Z" fill={OUTLINE} />
      <ellipse cx={50} cy={55} rx={4.5} ry={5.5} fill="url(#buddy-kira-accent)" />
    </svg>
  );
}

export function BuddyArt({ id }: { id: BuddyId }) {
  switch (id) {
    case "odie":
      return <OdieArt />;
    case "dante":
      return <DanteArt />;
    case "kira":
      return <KiraArt />;
  }
}
