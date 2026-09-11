import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playSound } from "../audio/audioEngine";
import { GameShell } from "../components/GameShell";
import { getBuddy } from "../data/buddies";
import { BUDDY_CHEER_MS, buddyCheer, buddyCheerTransition, buddyIdle, buddyIdleTransition } from "../data/buddyMotion";
import { useConfetti } from "../effects/useConfetti";
import { useTimers } from "../games/useTimers";
import { useProgressStore } from "../store/progressStore";
import { CloudArt } from "./artwork";
import { InteractiveObject } from "./InteractiveObject";
import type { ExplorationSceneConfig, InteractiveObjectConfig } from "./types";

interface ExplorationSceneProps {
  scene: ExplorationSceneConfig;
  onExit: () => void;
}

/** Chispeo (más discreto que el confeti de logro) para cada toque de causa-efecto. */
const DISCOVERY_SPARKLE_COUNT = 10;
/** Anticipación antes de que un objeto en cadena reaccione (Product Vision §35): que se
 * sienta como una consecuencia, no como un efecto instantáneo y mecánico. */
const CHAIN_DELAY_MS = 400;
/** Evita que toques muy seguidos de "pelota" amontonen ladridos del compañero. */
const BUDDY_NOTICE_COOLDOWN_MS = 1200;
/** Referencia estable: evita que un selector de Zustand devuelva un array nuevo cada render. */
const NO_DISCOVERIES: string[] = [];

/**
 * Motor reusable de Explorar (Product Vision §5, §18, §20): una escena
 * completa es esta pantalla + una `ExplorationSceneConfig` — sin meta, sin
 * ronda, sin pantalla de "lo lograste". El niño entra, el mundo ya se está
 * moviendo solo (nubes ambiente, ver AmbientClouds), y cada objeto
 * responde a su manera al tocarlo (ver InteractiveObject/reactions.ts).
 */
export function ExplorationScene({ scene, onExit }: ExplorationSceneProps) {
  const { t } = useTranslation();
  const selectedBuddy = useProgressStore((state) => state.selectedBuddy);
  const buddy = getBuddy(selectedBuddy);
  const recordDiscovery = useProgressStore((state) => state.recordDiscovery);
  const discoveries = useProgressStore((state) => state.discoveries[scene.id] ?? NO_DISCOVERIES);
  const [noticeSignal, setNoticeSignal] = useState(0);
  const [chainSignals, setChainSignals] = useState<Record<string, number>>({});
  const [buddyNoticing, setBuddyNoticing] = useState(false);
  const lastBuddyNoticeAt = useRef(0);
  const { burst, confettiField } = useConfetti();
  const { after } = useTimers();

  const handleObjectTap = useCallback(
    (event: { clientX: number; clientY: number }, object: InteractiveObjectConfig) => {
      burst(event.clientX, event.clientY, DISCOVERY_SPARKLE_COUNT);
      recordDiscovery(scene.id, object.id);
      setNoticeSignal((n) => n + 1);

      // Interacciones emergentes (Product Vision §35): este objeto puede
      // hacer reaccionar a otro, o al compañero, sin que el niño lo haya
      // tocado directamente — es lo que hace que el parque se sienta un
      // mundo y no una cuadrícula de botones independientes.
      if (object.chainTargetId) {
        const targetId = object.chainTargetId;
        after(CHAIN_DELAY_MS, () => {
          recordDiscovery(scene.id, targetId);
          setChainSignals((prev) => ({ ...prev, [targetId]: (prev[targetId] ?? 0) + 1 }));
        });
      }

      if (object.notifiesBuddy) {
        const now = Date.now();
        if (now - lastBuddyNoticeAt.current > BUDDY_NOTICE_COOLDOWN_MS) {
          lastBuddyNoticeAt.current = now;
          after(CHAIN_DELAY_MS, () => {
            setBuddyNoticing(true);
            playSound(buddy.barkSound);
            after(BUDDY_CHEER_MS[buddy.id], () => setBuddyNoticing(false));
          });
        }
      }
    },
    [burst, recordDiscovery, scene.id, after, buddy],
  );

  return (
    <GameShell
      onExit={onExit}
      background={scene.background}
      celebrateSignal={noticeSignal}
      confetti={confettiField}
      hideBuddy
    >
      <AmbientClouds />
      <GroundPath />

      {scene.objects.map((object) => (
        <InteractiveObject
          key={object.id}
          config={object}
          onTap={handleObjectTap}
          externalTrigger={chainSignals[object.id] ?? 0}
          initiallyRevealed={!object.startsHidden || discoveries.includes(object.id)}
        />
      ))}

      {/* El compañero vive DENTRO de la escena, no en la esquina: aquí es un
          personaje que explora junto al niño, no un ícono de marco (docs
          CURRICULUM.md — el mismo perrito elegido en HomeScreen). Nota lo
          que pasa en el mundo (p. ej. la pelota) con SU propio festejo,
          igual que cuando acierta en un nivel (buddyMotion.ts). */}
      <motion.img
        src={buddy.image}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          ...(buddyNoticing ? buddyCheer(buddy.id) : buddyIdle(buddy.id)),
        }}
        transition={{
          opacity: { duration: 0.5 },
          ...(buddyNoticing ? buddyCheerTransition(buddy.id) : buddyIdleTransition(buddy.id)),
          delay: buddyNoticing ? 0 : 0.4,
        }}
        style={{
          position: "absolute",
          left: "8%",
          bottom: "6%",
          width: "min(26vw, 110px)",
          pointerEvents: "none",
          filter: "drop-shadow(0 10px 14px rgba(58,46,34,0.22))",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "16%",
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%)",
          pointerEvents: "none",
        }}
      />

      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{t(scene.nameKey)}</span>
    </GameShell>
  );
}

/** Un camino de tierra serpenteante en el suelo — composición, no interacción
 * (evita que la escena se sienta "objetos flotando en un fondo liso"). */
function GroundPath() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <path
        d="M-5 105 Q20 82 12 68 Q4 54 30 50 Q56 46 50 30 Q46 18 60 -5"
        fill="none"
        stroke="#E4C98F"
        strokeWidth={9}
        strokeLinecap="round"
        opacity={0.55}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Un par de nubes propias, a la deriva, para que el mundo se sienta vivo
 * incluso si el niño no toca nada todavía (Product Vision §8). */
function AmbientClouds() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "6%",
          top: "10%",
          width: 70,
          height: 44,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        <CloudArt />
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -30, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "absolute",
          right: "10%",
          top: "18%",
          width: 50,
          height: 32,
          opacity: 0.7,
          pointerEvents: "none",
        }}
      >
        <CloudArt />
      </motion.div>
    </>
  );
}
