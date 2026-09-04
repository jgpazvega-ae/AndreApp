import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";

type ObjectType = "star" | "bell" | "balloon" | "flower";

const OBJECT_ASSET: Record<ObjectType, { image: string; voiceFile: string }> = {
  star: { image: asset("illustrations/object-star.png"), voiceFile: "object-star.mp3" },
  bell: { image: asset("illustrations/object-bell.png"), voiceFile: "object-bell.mp3" },
  balloon: { image: asset("illustrations/object-balloon.png"), voiceFile: "object-balloon.mp3" },
  flower: { image: asset("illustrations/object-flower.png"), voiceFile: "object-flower.mp3" },
};
const ALL_TYPES: ObjectType[] = ["star", "bell", "balloon", "flower"];

/** Reutiliza los elogios de proceso de N2 para celebrar la ronda completa. */
const ROUND_COMPLETE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

const BACKGROUND = "linear-gradient(160deg, #FFF3DC 0%, #FFD98A 100%)";
const MISMATCH_SHAKE_MS = 500;
const MATCH_RESOLVE_MS = 450;
const ROUND_COMPLETE_DELAY_MS = 1800;

interface Card {
  id: number;
  type: ObjectType;
}

function newRound(): Card[] {
  const chosenTypes = shuffle(ALL_TYPES).slice(0, 3);
  const cards = chosenTypes.flatMap((type, i) => [
    { id: i * 2, type },
    { id: i * 2 + 1, type },
  ]);
  return shuffle(cards);
}

interface N3EmparejarIdenticosProps {
  locale: string;
  onExit: () => void;
}

/**
 * N3 · Emparejar idénticos (docs/CURRICULUM.md ficha N3).
 * 6 tarjetas visibles (3 pares) — sin voltear, la memoria de posición es
 * un reto posterior (N13). Tocar dos que coinciden las empareja con
 * celebración; si no coinciden, un sacudido suave y silencioso las
 * deselecciona (sin sonido negativo: docs/CURRICULUM.md §2).
 */
export function N3EmparejarIdenticos({ locale, onExit }: N3EmparejarIdenticosProps) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>(() => newRound());
  const [selected, setSelected] = useState<Card | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [shakeIds, setShakeIds] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const { acknowledgeTap, celebrate, celebrateSignal, confettiField } = useGameSession("n3", {
    locale,
    welcomeFile: "n3-welcome.mp3",
  });

  // Ronda completa: celebrar y empezar una nueva.
  useEffect(() => {
    if (matchedIds.size === 0 || matchedIds.size < cards.length) return;
    const praise = setTimeout(() => playVoiceClip(locale, pickRandom(ROUND_COMPLETE_FILES)), 200);
    const next = setTimeout(() => {
      setCards(newRound());
      setMatchedIds(new Set());
    }, ROUND_COMPLETE_DELAY_MS);
    return () => {
      clearTimeout(praise);
      clearTimeout(next);
    };
  }, [matchedIds, cards.length, locale]);

  const handleTapCard = useCallback(
    (card: Card, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy || matchedIds.has(card.id) || card.id === selected?.id) return;

      // Primera carta: aún no hay acierto que celebrar, solo se acusa el toque.
      if (!selected) {
        acknowledgeTap();
        setSelected(card);
        return;
      }

      if (selected.type === card.type) {
        setBusy(true);
        celebrate(event);
        playVoiceClip(locale, OBJECT_ASSET[card.type].voiceFile);
        setTimeout(() => {
          setMatchedIds((prev) => new Set(prev).add(selected.id).add(card.id));
          setSelected(null);
          setBusy(false);
        }, MATCH_RESOLVE_MS);
      } else {
        // Sin confeti ni sonido negativo: el error no se castiga, solo se deshace.
        acknowledgeTap();
        setBusy(true);
        setShakeIds(new Set([selected.id, card.id]));
        setTimeout(() => {
          setShakeIds(new Set());
          setSelected(null);
          setBusy(false);
        }, MISMATCH_SHAKE_MS);
      }
    },
    [busy, matchedIds, selected, locale, acknowledgeTap, celebrate],
  );

  return (
    <GameShell
      levelId="n3"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-md)",
          padding: "calc(max(env(safe-area-inset-top), 16px) + 72px) var(--space-lg) var(--space-lg)",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {cards.map((card) => {
          const isMatched = matchedIds.has(card.id);
          const isSelected = selected?.id === card.id;
          const isShaking = shakeIds.has(card.id);
          return (
            <motion.button
              key={card.id}
              type="button"
              aria-label={isMatched ? t("a11y.cardMatched") : t("a11y.card")}
              disabled={isMatched}
              onPointerDown={(e) => handleTapCard(card, e)}
              animate={
                isShaking
                  ? { x: [0, -8, 8, -8, 8, 0] }
                  : { opacity: isMatched ? 0.35 : 1, scale: isMatched ? 0.88 : isSelected ? 1.08 : 1 }
              }
              transition={{ duration: isShaking ? MISMATCH_SHAKE_MS / 1000 : 0.25 }}
              style={{
                aspectRatio: "1",
                borderRadius: "var(--radius-md)",
                background: "rgba(255,255,255,0.92)",
                border: isSelected ? "3px solid var(--color-accent)" : "3px solid transparent",
                boxShadow: "var(--shadow-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-sm)",
              }}
            >
              <img
                src={OBJECT_ASSET[card.type].image}
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}
