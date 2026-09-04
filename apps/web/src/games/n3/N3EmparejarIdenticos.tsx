import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { useIdleHint } from "../useIdleHint";

type ObjectType = "star" | "bell" | "balloon" | "flower";

/**
 * Cada tipo tiene un color de mosaico suave propio: el color ayuda a que el
 * niño distinga los pares de un vistazo (redundancia perceptual, no solo la
 * forma) y hace el tablero más alegre sin tapar la ilustración.
 */
const OBJECT_ASSET: Record<ObjectType, { image: string; voiceFile: string; tile: [string, string] }> = {
  star: { image: asset("illustrations/object-star.png"), voiceFile: "object-star.mp3", tile: ["#FFF6D6", "#FFE29A"] },
  bell: { image: asset("illustrations/object-bell.png"), voiceFile: "object-bell.mp3", tile: ["#FFEDE0", "#FFD1B0"] },
  balloon: {
    image: asset("illustrations/object-balloon.png"),
    voiceFile: "object-balloon.mp3",
    tile: ["#FFE6F2", "#FFC6E2"],
  },
  flower: {
    image: asset("illustrations/object-flower.png"),
    voiceFile: "object-flower.mp3",
    tile: ["#E7F9EF", "#BFEFD3"],
  },
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
const MATCH_RESOLVE_MS = 260;
const ROUND_COMPLETE_DELAY_MS = 1900;

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
 * un reto posterior (N13). Tocar dos iguales las une con una celebración
 * clara (salto + confeti + la voz nombra el objeto + el mosaico se vuelve
 * verde con una palomita), para que el niño VEA que lo logró. Si no
 * coinciden, un meneo suave y silencioso las deselecciona (sin sonido
 * negativo: docs/CURRICULUM.md §2). Tras ~5 s sin tocar, un par parpadea
 * como pista (andamiaje).
 */
export function N3EmparejarIdenticos({ locale, onExit }: N3EmparejarIdenticosProps) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>(() => newRound());
  const [selected, setSelected] = useState<Card | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set());
  const [shakeIds, setShakeIds] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const { acknowledgeTap, celebrate, celebrateSignal, confettiField, roundComplete, continueRound } = useGameSession(
    "n3",
    { locale, welcomeFile: "n3-welcome.mp3" },
  );
  const { idle, resetIdle } = useIdleHint();

  const allMatched = matchedIds.size === cards.length;

  // Par sugerido como pista: el primer par de un tipo aún sin emparejar.
  // Solo se calcula (y muestra) cuando el niño lleva un rato sin tocar y no
  // hay una carta ya seleccionada esperando pareja.
  const hintIds = useMemo(() => {
    if (!idle || selected || busy || allMatched) return null;
    for (const type of ALL_TYPES) {
      const ofType = cards.filter((c) => c.type === type && !matchedIds.has(c.id));
      if (ofType.length === 2) return new Set(ofType.map((c) => c.id));
    }
    return null;
  }, [idle, selected, busy, allMatched, cards, matchedIds]);

  // Ronda completa: celebrar y empezar una nueva.
  useEffect(() => {
    if (!allMatched) return;
    const praise = setTimeout(() => playVoiceClip(locale, pickRandom(ROUND_COMPLETE_FILES)), 200);
    const next = setTimeout(() => {
      setCards(newRound());
      setMatchedIds(new Set());
      setPoppingIds(new Set());
    }, ROUND_COMPLETE_DELAY_MS);
    return () => {
      clearTimeout(praise);
      clearTimeout(next);
    };
  }, [allMatched, locale]);

  const handleTapCard = useCallback(
    (card: Card, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy || matchedIds.has(card.id) || card.id === selected?.id) return;
      resetIdle();

      // Primera carta: aún no hay acierto que celebrar, solo se acusa el toque.
      if (!selected) {
        acknowledgeTap();
        setSelected(card);
        return;
      }

      if (selected.type === card.type) {
        // Acierto: celebración inmediata y visible; el par "salta" y luego
        // se marca como emparejado (mosaico verde + palomita).
        setBusy(true);
        celebrate(event);
        playVoiceClip(locale, OBJECT_ASSET[card.type].voiceFile);
        setPoppingIds(new Set([selected.id, card.id]));
        setTimeout(() => {
          setMatchedIds((prev) => new Set(prev).add(selected.id).add(card.id));
          setPoppingIds(new Set());
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
    [busy, matchedIds, selected, locale, acknowledgeTap, celebrate, resetIdle],
  );

  return (
    <GameShell
      levelId="n3"
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
      // Sin esto, el tablero queda en flujo normal de bloque: se pega justo
      // debajo del encabezado y todo el resto de la pantalla queda vacío.
      // flex + centrado hace que el tablero use el espacio disponible.
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "grid",
          alignContent: "center",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-md)",
          padding: "calc(max(env(safe-area-inset-top), 16px) + 72px) var(--space-lg) var(--space-lg)",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {cards.map((card, index) => {
          const isMatched = matchedIds.has(card.id);
          const isSelected = selected?.id === card.id;
          const isShaking = shakeIds.has(card.id);
          const isPopping = poppingIds.has(card.id);
          const isHinting = hintIds?.has(card.id) ?? false;
          const [from, to] = OBJECT_ASSET[card.type].tile;

          return (
            <motion.button
              key={card.id}
              type="button"
              aria-label={isMatched ? t("a11y.cardMatched") : t("a11y.card")}
              disabled={isMatched}
              onPointerDown={(e) => handleTapCard(card, e)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={cardAnimate({ isShaking, isPopping, isSelected, isMatched, isHinting })}
              transition={cardTransition({ isShaking, isPopping, isHinting, index })}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "22px",
                background: isMatched
                  ? "linear-gradient(160deg, #C8F5DA 0%, #86E3AC 100%)"
                  : `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
                border: isSelected ? "4px solid var(--color-accent)" : "4px solid rgba(255,255,255,0.85)",
                boxShadow: isSelected ? "0 14px 22px rgba(240,140,30,0.35)" : "0 8px 16px rgba(140,90,20,0.16)",
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
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: isMatched ? 0.55 : 1,
                  filter: "drop-shadow(0 4px 6px rgba(120,70,20,0.18))",
                  transition: "opacity 0.3s",
                }}
              />

              {/* Palomita de "ya emparejado": señal clara e inequívoca de logro. */}
              <AnimatePresence>
                {isMatched && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 14 }}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: 6,
                      top: 6,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#2E9C6A",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}

interface CardState {
  isShaking: boolean;
  isPopping: boolean;
  isSelected: boolean;
  isMatched: boolean;
  isHinting: boolean;
}

function cardAnimate({ isShaking, isPopping, isSelected, isMatched, isHinting }: CardState) {
  if (isShaking) return { x: [0, -8, 8, -8, 8, 0], opacity: 1, scale: 1, y: 0 };
  if (isPopping) return { scale: [1, 1.28, 1], y: [0, -12, 0], opacity: 1, x: 0 };
  if (isMatched) return { scale: 1, opacity: 1, y: 0, x: 0 };
  if (isSelected) return { scale: 1.12, y: -6, opacity: 1, x: 0 };
  if (isHinting) return { scale: [1, 1.09, 1], opacity: 1, y: 0, x: 0 };
  return { scale: 1, opacity: 1, y: 0, x: 0 };
}

function cardTransition({
  isShaking,
  isPopping,
  isHinting,
  index,
}: Pick<CardState, "isShaking" | "isPopping" | "isHinting"> & { index: number }) {
  if (isShaking) return { duration: MISMATCH_SHAKE_MS / 1000 };
  if (isPopping) return { duration: MATCH_RESOLVE_MS / 1000, ease: "easeOut" as const };
  if (isHinting) return { duration: 0.9, repeat: Infinity, ease: "easeInOut" as const };
  // Entrada escalonada al iniciar una ronda: las cartas "brotan" una tras otra.
  return { type: "spring" as const, stiffness: 300, damping: 20, delay: index * 0.06 };
}
