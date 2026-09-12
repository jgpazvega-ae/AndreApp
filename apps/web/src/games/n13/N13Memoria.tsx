import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playVoiceClip } from "../../audio/audioEngine";
import { GameShell } from "../../components/GameShell";
import { asset } from "../../utils/asset";
import { pickRandom, shuffle } from "../../utils/random";
import { useGameSession } from "../useGameSession";
import { useIdleHint } from "../useIdleHint";
import { useTimers } from "../useTimers";

type PairType = "star" | "bell" | "balloon" | "flower" | "cat" | "duck";

/** Mismo color de mosaico por tipo que N3 (el color ayuda a distinguir de un
 * vistazo una vez volteada), pero aquí también hace falta el nombre en voz
 * para cerrar el acierto: en N3 el objeto ya se ve, aquí recién se revela. */
const PAIR_ASSET: Record<PairType, { image: string; voiceFile: string; tile: [string, string] }> = {
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
  cat: { image: asset("illustrations/animal-cat.png"), voiceFile: "n13-name-cat.mp3", tile: ["#FFE9DD", "#FFC7A8"] },
  duck: { image: asset("illustrations/animal-duck.png"), voiceFile: "n13-name-duck.mp3", tile: ["#FFF9D2", "#FFEC9E"] },
};
const ALL_TYPES: [PairType, ...PairType[]] = ["star", "bell", "balloon", "flower", "cat", "duck"];
const MAX_PAIRS = ALL_TYPES.length;

/** Reutiliza los elogios de proceso de N2 para celebrar el memorama completo. */
const ROUND_COMPLETE_FILES: [string, ...string[]] = [
  "n2-praise-1.mp3",
  "n2-praise-2.mp3",
  "n2-praise-3.mp3",
  "n2-praise-4.mp3",
];

const BACKGROUND = "linear-gradient(160deg, #F0E9FF 0%, #D8C7FF 100%)";
const CARD_BACK = "linear-gradient(160deg, #B9A6F5 0%, #9B82ED 100%)";
/** Cuánto queda visible un par que NO combina antes de voltearse de nuevo:
 * más largo que el meneo de N3 porque aquí primero hay que MIRAR ambas
 * tarjetas para recordarlas después, no solo notar que no combinan. */
const MISMATCH_PEEK_MS = 950;
const MATCH_RESOLVE_MS = 320;
const FLIP_MS = 0.32;
const ROUND_COMPLETE_DELAY_MS = 1900;

interface Card {
  id: number;
  type: PairType;
}

/** Empieza en 2 pares y escala hasta 6 conforme se completan memoramas
 * (docs/CURRICULUM.md ficha N13: techo adaptativo, aquí por desempeño en
 * vez de por edad — la app no le pide la edad del niño a la familia). */
function pairsForRound(roundIndex: number): number {
  return Math.min(2 + roundIndex, MAX_PAIRS);
}

function newRound(roundIndex: number): Card[] {
  const chosenTypes = shuffle(ALL_TYPES).slice(0, pairsForRound(roundIndex));
  const cards = chosenTypes.flatMap((type, i) => [
    { id: i * 2, type },
    { id: i * 2 + 1, type },
  ]);
  return shuffle(cards);
}

interface N13MemoriaProps {
  locale: string;
  onExit: () => void;
}

/**
 * N13 · Memoria (docs/CURRICULUM.md ficha N13, memoria de trabajo 🧠).
 * Tarjetas boca abajo; tocar dos las voltea. Si combinan, se quedan boca
 * arriba (mosaico verde + palomita, igual que N3) y se nombra en voz lo
 * que era. Si no combinan, ambas se ven un momento (para poder recordarlas)
 * y luego se voltean de nuevo — sin sonido negativo, solo una voz que anima
 * a seguir intentando. Empieza con 2 pares y crece de a uno por memorama
 * completo, hasta 6.
 */
export function N13Memoria({ locale, onExit }: N13MemoriaProps) {
  const { t } = useTranslation();
  const [roundIndex, setRoundIndex] = useState(0);
  const [cards, setCards] = useState<Card[]>(() => newRound(0));
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [shakeIds, setShakeIds] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const { acknowledgeTap, celebrate, encourage, celebrateSignal, confettiField, roundComplete, continueRound } =
    useGameSession("n13", { locale, welcomeFile: "n13-welcome.mp3" });
  const { idle, resetIdle } = useIdleHint();
  const { after } = useTimers();
  // El tamaño del memorama (2-6 pares) no es múltiplo del cierre de ronda
  // compartido (cada 5 aciertos): igual que en N3/N6, cuando coinciden se
  // evita el elogio local duplicado con el de LevelCompleteOverlay.
  const lastMatchClosedSharedRoundRef = useRef(false);

  const allMatched = matchedIds.size === cards.length;

  // Pista por inactividad: pulsa (sin voltear) un par real todavía sin
  // encontrar. Da una pista posicional sin regalar de qué tipo es, para
  // no arruinar el reto de memoria — solo "prueba aquí".
  const hintIds = useMemo(() => {
    if (!idle || revealedIds.length > 0 || busy || allMatched) return null;
    for (const type of ALL_TYPES) {
      const ofType = cards.filter((c) => c.type === type && !matchedIds.has(c.id));
      if (ofType.length === 2) return new Set(ofType.map((c) => c.id));
    }
    return null;
  }, [idle, revealedIds, busy, allMatched, cards, matchedIds]);

  useEffect(() => {
    if (!allMatched) return;
    const praise = lastMatchClosedSharedRoundRef.current
      ? null
      : setTimeout(() => playVoiceClip(locale, pickRandom(ROUND_COMPLETE_FILES)), 200);
    const next = setTimeout(() => {
      const nextRoundIndex = roundIndex + 1;
      setRoundIndex(nextRoundIndex);
      setCards(newRound(nextRoundIndex));
      setRevealedIds([]);
      setMatchedIds(new Set());
    }, ROUND_COMPLETE_DELAY_MS);
    return () => {
      if (praise) clearTimeout(praise);
      clearTimeout(next);
    };
  }, [allMatched, roundIndex, locale]);

  const handleTapCard = useCallback(
    (card: Card, event: React.PointerEvent<HTMLButtonElement>) => {
      if (busy || matchedIds.has(card.id) || revealedIds.includes(card.id)) return;
      resetIdle();

      if (revealedIds.length === 0) {
        // Primera tarjeta: solo se voltea y se acusa el toque, aún no hay nada que celebrar.
        acknowledgeTap();
        setRevealedIds([card.id]);
        return;
      }

      const firstId = revealedIds[0]!;
      const first = cards.find((c) => c.id === firstId)!;
      setRevealedIds([firstId, card.id]);
      setBusy(true);

      if (first.type === card.type) {
        after(MATCH_RESOLVE_MS, () => {
          lastMatchClosedSharedRoundRef.current = celebrate(event);
          playVoiceClip(locale, PAIR_ASSET[card.type].voiceFile);
          setMatchedIds((prev) => new Set(prev).add(firstId).add(card.id));
          setRevealedIds([]);
          setBusy(false);
        });
      } else {
        encourage();
        after(MISMATCH_PEEK_MS, () => {
          setShakeIds(new Set([firstId, card.id]));
          setRevealedIds([]);
          setBusy(false);
          after(400, () => setShakeIds(new Set()));
        });
      }
    },
    [busy, matchedIds, revealedIds, cards, locale, acknowledgeTap, celebrate, encourage, resetIdle, after],
  );

  return (
    <GameShell
      onExit={onExit}
      background={BACKGROUND}
      celebrateSignal={celebrateSignal}
      confetti={confettiField}
      locale={locale}
      roundComplete={roundComplete}
      onPlayAgain={continueRound}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "grid",
          alignContent: "center",
          justifyContent: "center",
          gridTemplateColumns: "repeat(3, minmax(0, 96px))",
          gap: "var(--space-sm)",
          padding: "calc(max(env(safe-area-inset-top), 16px) + 72px) var(--space-md) var(--space-lg)",
        }}
      >
        {cards.map((card, index) => {
          const isMatched = matchedIds.has(card.id);
          const isRevealed = isMatched || revealedIds.includes(card.id);
          const isShaking = shakeIds.has(card.id);
          const isHinting = hintIds?.has(card.id) ?? false;
          const [from, to] = PAIR_ASSET[card.type].tile;

          return (
            <motion.button
              key={card.id}
              type="button"
              aria-label={isMatched ? t("a11y.cardMatched") : t("a11y.card")}
              disabled={isMatched}
              onPointerDown={(e) => handleTapCard(card, e)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: isShaking ? [0, -8, 8, -8, 8, 0] : 0,
              }}
              transition={{
                x: { duration: isShaking ? 0.4 : 0 },
                default: { type: "spring", stiffness: 300, damping: 20, delay: index * 0.04 },
              }}
              style={{
                position: "relative",
                aspectRatio: "1",
                background: "none",
                border: "none",
                padding: 0,
                perspective: 600,
              }}
            >
              <motion.div
                animate={{ rotateY: isRevealed ? 180 : 0, scale: isHinting ? [1, 1.08, 1] : 1 }}
                transition={{
                  rotateY: { duration: FLIP_MS, ease: "easeInOut" },
                  scale: isHinting ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0 },
                }}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Reverso: lo que se ve boca abajo, igual para todas las tarjetas. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    borderRadius: "20px",
                    background: CARD_BACK,
                    border: "4px solid rgba(255,255,255,0.85)",
                    boxShadow: "0 8px 16px rgba(90,60,160,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    opacity: 0.85,
                  }}
                >
                  🐾
                </div>

                {/* Frente: el objeto, solo visible al voltear (rotateY 180). */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderRadius: "20px",
                    background: isMatched
                      ? "linear-gradient(160deg, #C8F5DA 0%, #86E3AC 100%)"
                      : `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
                    border: "4px solid rgba(255,255,255,0.85)",
                    boxShadow: "0 8px 16px rgba(140,90,20,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "var(--space-xs)",
                  }}
                >
                  <img
                    src={PAIR_ASSET[card.type].image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      opacity: isMatched ? 0.55 : 1,
                      filter: "drop-shadow(0 4px 6px rgba(120,70,20,0.18))",
                    }}
                  />
                  {isMatched && (
                    <div
                      style={{
                        position: "absolute",
                        right: 4,
                        top: 4,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "#2E9C6A",
                        color: "#fff",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}
