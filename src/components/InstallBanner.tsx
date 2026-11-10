import { useEffect, useState } from 'react'
import { DownloadSimple, X } from '@phosphor-icons/react'
import { uiIconProps } from './ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { OverlayPortal } from './ui/OverlayPortal'
import { isDesignGateCapture } from '../e2e/designGate'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

function BannerBody({
  onDismiss,
  onInstall,
  showInstall,
  gate,
}: {
  onDismiss: () => void
  onInstall: () => void
  showInstall: boolean
  gate: boolean
}) {
  const { t } = useTranslation()
  return (
    <aside
      data-testid="install-banner"
      className="banner install-banner-ds"
      role="region"
      aria-label={gate ? 'Instalar no celular' : t('pwa.installTitle')}
      style={gate ? undefined : { position: 'fixed', zIndex: 50 }}
    >
      {gate ? (
        <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3.5V15M7.5 11 12 15.5 16.5 11" />
          <path d="M5 19.5h14" />
        </svg>
      ) : (
        <DownloadSimple {...uiIconProps} className="ic" aria-hidden />
      )}
      <div className="banner-body">
        <span className="banner-title">{gate ? 'Instalar no celular' : t('pwa.installTitle')}</span>
        <p className="hint">
          {gate ? 'Atalho na tela inicial enquanto joga.' : t('pwa.installBody')}
        </p>
        <div className="banner-act">
          {showInstall ? (
            <button
              type="button"
              className="btn btn--primary"
              data-testid="install-banner-install"
              onClick={onInstall}
            >
              {gate ? 'Instalar' : t('pwa.install')}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost"
            data-testid="install-banner-dismiss"
            onClick={onDismiss}
          >
            {gate ? 'Agora não' : t('pwa.dismiss')}
          </button>
        </div>
      </div>
      {!gate ? (
        <button
          type="button"
          className="btn btn--icon btn--ghost"
          onClick={onDismiss}
          aria-label={t('pwa.dismiss')}
        >
          <X {...uiIconProps} width={22} height={22} className="ic" />
        </button>
      ) : null}
    </aside>
  )
}

export function InstallBanner() {
  const gate = isDesignGateCapture()
  const dismissed = useAppStore((s) => s.settings.installBannerDismissed)
  const iosDismissed = useAppStore((s) => s.settings.iosInstallHintDismissed)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  const isIos =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      if (!dismissed) setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  useEffect(() => {
    if (isIos && !iosDismissed && !window.matchMedia('(display-mode: standalone)').matches) {
      setVisible(true)
    }
  }, [isIos, iosDismissed])

  if (!visible || window.matchMedia('(display-mode: standalone)').matches) return null

  const dismiss = () => {
    setVisible(false)
    if (isIos) updateSettings({ iosInstallHintDismissed: true })
    else updateSettings({ installBannerDismissed: true })
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  const body = (
    <BannerBody
      gate={gate}
      onDismiss={dismiss}
      onInstall={install}
      showInstall={Boolean(deferred) || gate}
    />
  )

  if (gate) {
    return (
      <div className="toast-slot" data-testid="toast-stack">
        {body}
      </div>
    )
  }

  return <OverlayPortal>{body}</OverlayPortal>
}
