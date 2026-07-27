export function vibrate(): void {
  if (!navigator.vibrate) return;

  try {
    navigator.vibrate([100, 50, 200]);
  } catch {
    // Vibration API non supportata
  }
}
