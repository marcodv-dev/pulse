let wakeLockSentinel: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) return;

  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
  } catch {
    // Wake Lock non disponibile
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    await wakeLockSentinel.release();
    wakeLockSentinel = null;
  }
}
