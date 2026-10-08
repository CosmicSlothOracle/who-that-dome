let wakeLock: WakeLockSentinel | null = null;

/** Muss aus einer Nutzergeste kommen (Tap auf Play). Fehler sind unkritisch. */
export async function enterImmersive(): Promise<void> {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  } catch {
    // iOS Safari kennt kein Fullscreen für Seiten
  }
  try {
    wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
  } catch {
    wakeLock = null;
  }
}

export async function leaveImmersive(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    // ignorieren
  }
  try {
    await wakeLock?.release();
  } catch {
    // ignorieren
  }
  wakeLock = null;
}
