export type ShapeType = "circle" | "square" | "triangle" | "star";

/**
 * Cada forma tiene un color fijo (no aleatorio): en N6 la forma es la única
 * variable que importa (docs/CURRICULUM.md ficha N6, dominio espacial). Si
 * el color cambiara entre rondas, se volvería una segunda pista que compite
 * con la que se quiere enseñar.
 */
export const SHAPE_COLOR: Record<ShapeType, string> = {
  circle: "#FF9466",
  square: "#7C6FF0",
  triangle: "#3DBBA0",
  star: "#F58BC0",
};

function ShapePath({ type }: { type: ShapeType }) {
  switch (type) {
    case "circle":
      return <circle cx="50" cy="50" r="42" />;
    case "square":
      return <rect x="12" y="12" width="76" height="76" rx="16" />;
    case "triangle":
      return <polygon points="50,10 92,86 8,86" strokeLinejoin="round" />;
    case "star":
      return <polygon points="50,4 61,36 96,36 68,57 79,92 50,71 21,92 32,57 4,36 39,36" strokeLinejoin="round" />;
  }
}

interface ShapeIconProps {
  type: ShapeType;
  /** "piece" = relleno de color (la pieza real). "slot" = solo contorno punteado (el hueco a llenar). */
  variant: "piece" | "slot";
}

export function ShapeIcon({ type, variant }: ShapeIconProps) {
  const color = SHAPE_COLOR[type];
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }} aria-hidden="true">
      <g
        fill={variant === "piece" ? color : "none"}
        stroke={color}
        strokeWidth={variant === "slot" ? 5 : 0}
        strokeDasharray={variant === "slot" ? "9 8" : undefined}
        strokeLinecap="round"
      >
        <ShapePath type={type} />
      </g>
    </svg>
  );
}
