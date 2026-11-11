export const APP_OVERLAY_ROOT_ID = 'app-overlay-root'

export function getOverlayRoot(): HTMLElement {
  if (typeof document === 'undefined') return null as unknown as HTMLElement
  return document.getElementById(APP_OVERLAY_ROOT_ID) ?? document.body
}
