/** Short tap haptic when supported (mobile). */
export function hapticTap(ms = 12): void {
  if (typeof navigator === 'undefined') return
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}
