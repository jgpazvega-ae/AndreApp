import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { GameShell } from "../components/GameShell";
import { getBuddy } from "../data/buddies";
import { buddyIdle, buddyIdleTransition } from "../data/buddyMotion";
import { useConfetti } from "../effects/useConfetti";
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
  const [noticeSignal, setNoticeSignal] = useState(0);
  const { burst, confettiField } = useConfetti();

  const handleObjectTap = useCallback(
    (event: { clientX: number; clientY: number }, object: InteractiveObjectConfig) => {
      burst(event.clientX, event.clientY, DISCOVERY_SPARKLE_COUNT);
      recordDiscovery(scene.id, object.id);
      setNoticeSignal((n) => n + 1);
    },
    [burst, recordDiscovery, scene.id],
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

      {scene.objects.map((object) => (
        <InteractiveObject key={object.id} config={object} onTap={handleObjectTap} />
      ))}

      {/* El compañero vive DENTRO de la escena, no en la esquina: aquí es un
          personaje que explora junto al niño, no un ícono de marco (docs
          CURRICULUM.md — el mismo perrito elegido en HomeScreen). */}
      <motion.img
        src={buddy.image}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, ...buddyIdle(buddy.id) }}
        transition={{ opacity: { duration: 0.5 }, ...buddyIdleTransition(buddy.id), delay: 0.4 }}
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
