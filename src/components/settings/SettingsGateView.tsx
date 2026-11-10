import { GATE_SETTINGS_BODY_FRESH, GATE_SETTINGS_BODY_STALE } from './gateSettingsBodyHtml'

/** Full page sections from `ajustes.html` / `ajustes-dados-velhos.html` (capture-only). */
export function SettingsGateView({ stale }: { stale: boolean; onResetTrigger?: () => void }) {
  const html = stale ? GATE_SETTINGS_BODY_STALE : GATE_SETTINGS_BODY_FRESH
  return (
    <div
      className="settings-gate-body-static"
      data-testid="settings-gate-body"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
