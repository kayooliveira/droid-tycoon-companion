import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import {
  DownloadSimple,
  LinkSimple,
  Moon,
  ShareNetwork,
  UploadSimple,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { FeedbackWhatsAppLink } from '../components/FeedbackWhatsAppLink'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { Button } from '../components/ui/Button'
import { InsetGroup } from '../components/ui/InsetGroup'
import { Modal } from '../components/ui/Modal'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { gameDataSource } from '../data/dataSource'
import type { AppLocale } from '../i18n/detectLocale'
import { useAppStore, applyTheme } from '../store/useAppStore'
import type { ThemeMode } from '../storage/types'
import type { PersistedState } from '../storage/types'
import { downloadJson, exportProgress, parseImportJson } from '../storage/exportImport'
import { useToast } from '../components/ToastProvider'
import { setDocumentLanguage } from '../i18n'
import { initI18n } from '../i18n/index'
import { uiIconProps } from '../components/ui/iconStyle'
import { APP_PUBLIC_URL, WHATSAPP_SHARE_BASE } from '../lib/constants'
import { renderShareProgressCard } from '../lib/shareProgressCard'
import { cn } from '../lib/utils'
async function downloadOrShare(blob: Blob, filename: string, mime: string) {
  const file = new File([blob], filename, { type: mime })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function SettingsSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
        checked ? 'bg-[var(--ui-accent-fill)] border-transparent' : 'bg-ui-field-muted border-ui',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { push } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<PersistedState | null>(null)
  const [shareBusy, setShareBusy] = useState(false)

  const settings = useAppStore((s) => s.settings)
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setProgress = useAppStore((s) => s.setProgress)
  const setLocale = useAppStore((s) => s.setLocale)
  const resetAll = useAppStore((s) => s.resetAll)
  const importState = useAppStore((s) => s.importState)
  const toPersisted = useAppStore((s) => s.toPersisted)

  const meta = gameDataSource.getMeta()
  const stale = gameDataSource.isStale()

  const changeLanguage = (locale: AppLocale) => {
    setLocale(locale, 'user')
    void initI18n(locale)
    setDocumentLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme })
    applyTheme(theme)
  }

  const rerunOnboarding = () => {
    navigate('/onboarding?rerun=1')
  }

  const confirmImport = () => {
    if (!pendingImport) return
    importState(pendingImport)
    push(t('settings.importOk'), { variant: 'success' })
    setPendingImport(null)
    setImportOpen(false)
  }

  const confirmReset = () => {
    resetAll()
    push(t('settings.resetDone'), { variant: 'warning' })
    setResetOpen(false)
    navigate('/onboarding')
  }

  const shareText = t('share.message', { url: APP_PUBLIC_URL })

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('app.name'),
          text: shareText,
          url: APP_PUBLIC_URL,
        })
        return
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(`${shareText}\n${APP_PUBLIC_URL}`)
    push(t('share.linkCopied'), { variant: 'success' })
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${APP_PUBLIC_URL}`)
    window.open(`${WHATSAPP_SHARE_BASE}${text}`, '_blank', 'noopener,noreferrer')
  }

  const shareProgressImage = async () => {
    setShareBusy(true)
    try {
      const blob = await renderShareProgressCard({
        pathId: progress.pathId,
        nextRebirth: progress.nextRebirth,
        completedOnPath: progress.completedOnPath,
        inventory,
        locale: settings.locale === 'pt-BR' ? 'pt-BR' : 'en',
      })
      const file = new File([blob], 'droid-tycoon-progress.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t('share.cardTitle'),
          text: APP_PUBLIC_URL,
        })
        push(t('share.cardShared'), { variant: 'success' })
        return
      }
      await downloadOrShare(blob, 'droid-tycoon-progress.png', 'image/png')
      push(t('share.cardDownloaded'), { variant: 'success' })
    } catch {
      push(t('share.cardFailed'), { variant: 'error' })
    } finally {
      setShareBusy(false)
    }
  }

  return (
    <TabScrollLayout title={t('nav.more')} testId="settings-page">
      <h2 className="dc-section-header">{t('settings.appearance')}</h2>
      <InsetGroup>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.theme')}</span>
          </div>
        </div>
        <div className="px-4 pb-3">
          <SegmentedControl
            compact
            className="!mx-0"
            ariaLabel={t('settings.theme')}
            value={settings.theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: t('settings.themeDark'), icon: <Moon {...uiIconProps} /> },
              { value: 'light', label: t('settings.themeLight') },
              { value: 'system', label: t('settings.themeSystemShort') },
            ]}
          />
        </div>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.animations')}</span>
          </div>
          <div className="dc-row-trail">
            <SettingsSwitch
              label={t('settings.animations')}
              checked={settings.animationsEnabled}
              onChange={(v) => updateSettings({ animationsEnabled: v })}
            />
          </div>
        </div>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.trackInventory')}</span>
          </div>
          <div className="dc-row-trail">
            <SettingsSwitch
              label={t('settings.trackInventory')}
              checked={settings.trackInventory}
              onChange={(v) => updateSettings({ trackInventory: v })}
            />
          </div>
        </div>
      </InsetGroup>

      <h2 className="dc-section-header">{t('settings.language')}</h2>
      <InsetGroup>
        <div className="px-4 py-3" data-testid="language-select">
          <SegmentedControl
            compact
            className="!mx-0"
            ariaLabel={t('settings.language')}
            value={settings.locale}
            onChange={changeLanguage}
            options={[
              { value: 'pt-BR', label: '🇧🇷 PT' },
              { value: 'en', label: '🇺🇸 EN' },
            ]}
          />
        </div>
      </InsetGroup>

      <h2 className="dc-section-header">{t('settings.progress')}</h2>
      <InsetGroup>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.path')}</span>
            <span className="dc-row-sub">
              <PathProgressSwitcher compact />
            </span>
          </div>
        </div>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('progress.pathProgress')}</span>
            <span className="dc-row-sub">
              <ProgressSummaryLine />
            </span>
          </div>
        </div>
        <div className="dc-row flex-col !items-stretch gap-2">
          <span className="dc-row-label">{t('settings.completedRebirths', { n: progress.completedOnPath })}</span>
          <input
            type="range"
            min={0}
            max={40}
            value={progress.completedOnPath}
            className="w-full accent-[var(--ui-accent-fill)]"
            onChange={(e) => {
              const completed = Number(e.target.value)
              setProgress(completed + 1, completed)
            }}
          />
        </div>
      </InsetGroup>

      <h2 className="dc-section-header">{t('settings.dataSection')}</h2>
      <InsetGroup footer={t('settings.updateHint')}>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.gameData')}</span>
            <span className="dc-row-sub">
              {`v${meta.dataVersion} · ${meta.gameVersion}`}
              {stale ? ` · ${t('settings.dataStaleShort')}` : ` · ${t('settings.dataFresh')}`}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="dc-row dc-row-chevron"
          onClick={() => downloadJson('droid-tycoon-progress.json', exportProgress(toPersisted()))}
        >
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.exportShort')}</span>
          </div>
          <DownloadSimple {...uiIconProps} className="dc-row-trail shrink-0 opacity-60" />
        </button>
        <button
          type="button"
          className="dc-row dc-row-chevron"
          data-testid="settings-import-trigger"
          onClick={() => fileRef.current?.click()}
        >
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.importShort')}</span>
          </div>
          <UploadSimple {...uiIconProps} className="dc-row-trail shrink-0 opacity-60" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            const text = await file.text()
            const result = parseImportJson(text)
            if (!result.ok) {
              push(t('settings.importFailTitle'), {
                variant: 'error',
                detail: t('settings.importFailDetail'),
              })
              return
            }
            setPendingImport(result.state)
            setImportOpen(true)
          }}
        />
      </InsetGroup>

      <h2 className="dc-section-header">{t('shareExport.title')}</h2>
      <InsetGroup footer={t('shareExport.footer')} testId="share-export-card">
        <button type="button" className="dc-row dc-row-chevron" data-testid="share-app" onClick={() => void shareApp()}>
          <div className="dc-row-main">
            <span className="dc-row-label">{t('share.shareApp')}</span>
          </div>
          <LinkSimple {...uiIconProps} className="shrink-0 opacity-60" />
        </button>
        <button type="button" className="dc-row dc-row-chevron" onClick={shareWhatsApp}>
          <div className="dc-row-main">
            <span className="dc-row-label">{t('share.whatsapp')}</span>
          </div>
          <WhatsappLogo {...uiIconProps} className="shrink-0 opacity-60" />
        </button>
        <button
          type="button"
          className="dc-row dc-row-chevron"
          disabled={shareBusy}
          data-testid="share-progress-card"
          onClick={() => void shareProgressImage()}
        >
          <div className="dc-row-main">
            <span className="dc-row-label">{t('share.progressCard')}</span>
          </div>
          <ShareNetwork {...uiIconProps} className="shrink-0 opacity-60" />
        </button>
      </InsetGroup>

      <h2 className="dc-section-header">{t('settings.aboutSection')}</h2>
      <InsetGroup>
        <button type="button" className="dc-row dc-row-chevron" onClick={rerunOnboarding}>
          <div className="dc-row-main">
            <span className="dc-row-label">{t('settings.rerunOnboardingShort')}</span>
          </div>
        </button>
        <Link to="/about" className="dc-row dc-row-chevron">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('nav.about')}</span>
          </div>
        </Link>
        <div className="dc-row">
          <FeedbackWhatsAppLink variant="link" className="text-sm" />
        </div>
      </InsetGroup>

      <h2 className="dc-section-header">{t('settings.danger')}</h2>
      <InsetGroup>
        <button
          type="button"
          className="dc-row"
          data-testid="settings-reset-trigger"
          onClick={() => setResetOpen(true)}
        >
          <span className="dc-row-label text-red-500">{t('settings.resetShort')}</span>
        </button>
      </InsetGroup>

      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setPendingImport(null)
        }}
        title={t('settings.importConfirmTitle')}
        testId="settings-import-modal"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="settings-import-cancel"
              onClick={() => {
                setImportOpen(false)
                setPendingImport(null)
              }}
            >
              {t('path.cancel')}
            </Button>
            <Button size="sm" data-testid="settings-import-confirm" onClick={confirmImport}>
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ui-secondary text-pretty">{t('settings.importConfirmBody')}</p>
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t('settings.resetConfirmTitle')}
        testId="settings-reset-modal"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              data-testid="settings-reset-cancel"
              onClick={() => setResetOpen(false)}
            >
              {t('path.cancel')}
            </Button>
            <Button variant="danger" size="sm" data-testid="settings-reset-confirm" onClick={confirmReset}>
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ui-secondary text-pretty">{t('settings.resetConfirmBody')}</p>
      </Modal>

      <div className="dc-scroll-spacer" aria-hidden />
    </TabScrollLayout>
  )
}
