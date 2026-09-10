import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useProgressStore } from "../store/progressStore";

interface FavoriteHeartProps {
  /** Id del nivel o "explore:<sceneId>" — ver progressStore.favoriteIds. */
  id: string;
}

/**
 * Corazoncito de favorito para una tarjeta de nivel/escena (Product Vision
 * §17, Favoritos). Vive como overlay independiente de BigButton (no una
 * prop más) porque el toque debe capturarse ANTES de llegar al botón
 * grande: tocar el corazón nunca debe abrir el nivel.
 */
export function FavoriteHeart({ id }: FavoriteHeartProps) {
  const { t } = useTranslation();
  const isFavorite = useProgressStore((state) => state.favoriteIds.includes(id));
  const toggleFavorite = useProgressStore((state) => state.toggleFavorite);

  return (
    <motion.button
      type="button"
      aria-label={t(isFavorite ? "a11y.favoriteOn" : "a11y.favoriteOff")}
      aria-pressed={isFavorite}
      onPointerDown={(event) => {
        event.stopPropagation();
        toggleFavorite(id);
      }}
      whileTap={{ scale: 0.8 }}
      style={{
        position: "absolute",
        top: 6,
        left: 6,
        zIndex: 2,
        width: 30,
        height: 30,
        borderRadius: "var(--radius-pill)",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "var(--shadow-soft)",
        fontSize: "0.95rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span aria-hidden="true">{isFavorite ? "❤️" : "🤍"}</span>
    </motion.button>
  );
}
