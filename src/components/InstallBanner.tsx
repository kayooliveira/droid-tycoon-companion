import { useEffect, useState } from 'react'
import { DownloadSimple, X } from '@phosphor-icons/react'
import { uiIconProps } from './ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { Button } from './ui/Button'

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
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 glass-panel rounded-2xl p-4 shadow-xl">
      <div className="flex gap-3">
        <DownloadSimple {...uiIconProps} className="text-holo-300 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{t('pwa.installTitle')}</p>
          <p className="text-xs text-zinc-400 mt-1">
            {isIos && !deferred ? t('pwa.iosHint') : t('pwa.installBody')}
          </p>
          <div className="flex gap-2 mt-3">
            {deferred ? (
              <Button className="text-xs py-2 px-3" onClick={install}>
                {t('pwa.install')}
              </Button>
            ) : null}
            <Button variant="ghost" className="text-xs py-2 px-3" onClick={dismiss}>
              {t('pwa.dismiss')}
            </Button>
          </div>
        </div>
        <button type="button" className="text-zinc-500 hover:text-zinc-300" onClick={dismiss} aria-label={t('pwa.dismiss')}>
          <X {...uiIconProps} />
        </button>
      </div>
    </div>
  )
}
