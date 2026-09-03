import { useEffect, useState } from "react";
import { isAudioUnlocked, onAudioUnlock } from "./audioEngine";

export function useAudioUnlock(): boolean {
  const [unlocked, setUnlocked] = useState(isAudioUnlocked());

  useEffect(() => {
    if (unlocked) return;
    return onAudioUnlock(() => setUnlocked(true));
  }, [unlocked]);

  return unlocked;
}
