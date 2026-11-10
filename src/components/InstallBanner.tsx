import { useEffect, useState } from 'react'
import { DownloadSimple, X } from '@phosphor-icons/react'
import { uiIconProps } from './ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { OverlayPortal } from './ui/OverlayPortal'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

export function InstallBanner() {
  const { t } = useTranslation()
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

  return (
    <OverlayPortal>
      <aside
        data-testid="install-banner"
        className="banner install-banner-ds"
        style={{ position: 'fixed', zIndex: 50 }}
      >
        <DownloadSimple {...uiIconProps} className="ic" aria-hidden />
        <div className="banner-body">
          <span className="banner-title">{t('pwa.installTitle')}</span>
          <p className="hint">{isIos && !deferred ? t('pwa.iosHint') : t('pwa.installBody')}</p>
          <div className="banner-act">
            {deferred ? (
              <button
                type="button"
                className="btn btn--primary"
                data-testid="install-banner-install"
                onClick={install}
              >
                {t('pwa.install')}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn--ghost"
              data-testid="install-banner-dismiss"
              onClick={dismiss}
            >
              {t('pwa.dismiss')}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="btn btn--icon btn--ghost"
          onClick={dismiss}
          aria-label={t('pwa.dismiss')}
        >
          <X {...uiIconProps} width={22} height={22} className="ic" />
        </button>
      </aside>
    </OverlayPortal>
  )
}
