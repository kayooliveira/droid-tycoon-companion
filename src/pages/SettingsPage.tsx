import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  DownloadSimple,
  LinkSimple,
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
import { DsSwitch } from '../components/ui/DsSwitch'
import { gameDataSource } from '../data/dataSource'
import type { AppLocale } from '../i18n/detectLocale'
import { useAppStore } from '../store/useAppStore'
import { useAppearance } from '../hooks/useAppearance'
import type { PersistedState } from '../storage/types'
import { downloadJson, exportProgress, parseImportJson } from '../storage/exportImport'
import { useToast } from '../components/ToastProvider'
import { setDocumentLanguage } from '../i18n'
import { initI18n } from '../i18n/index'
import { uiIconProps } from '../components/ui/iconStyle'
import { APP_PUBLIC_URL, WHATSAPP_SHARE_BASE } from '../lib/constants'
import { renderShareProgressCard } from '../lib/shareProgressCard'
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

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
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

  useEffect(() => {
    if (params.get('e2e_import_modal') === '1') {
      setPendingImport(toPersisted())
      setImportOpen(true)
    }
  }, [params, toPersisted])

  const changeLanguage = (locale: AppLocale) => {
    setLocale(locale, 'user')
    void initI18n(locale)
    setDocumentLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  const { theme: appearanceTheme, modePref, resolvedMode } = useAppearance()
  const appearanceSummary = t(`appearance.themes.${appearanceTheme}.name`)
  const modeSummary =
    modePref === 'system'
      ? t('settings.themeSystemShort')
      : modePref === 'light'
        ? t('settings.themeLight')
        : t('settings.themeDark')

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
    <TabScrollLayout title={t('settings.title')} testId="settings-page">
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.appearance')}</h2>
        </div>
        <Link
          to="/settings/appearance"
          className="row"
          data-testid="settings-appearance-link"
        >
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('appearance.themeAndMode')}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {appearanceSummary} · {modeSummary}
              {modePref === 'system' ? ` (${resolvedMode})` : ''}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.preferences')}</h2>
        </div>
        <DsSwitch
          label={t('settings.animations')}
          checked={settings.animationsEnabled}
          onChange={(v) => updateSettings({ animationsEnabled: v })}
        />
        <DsSwitch
          label={t('settings.trackInventory')}
          checked={settings.trackInventory}
          onChange={(v) => updateSettings({ trackInventory: v })}
        />
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.language')}</h2>
        </div>
        <div data-testid="language-select">
        <SegmentedControl
          ariaLabel={t('settings.language')}
          value={settings.locale}
          onChange={changeLanguage}
          options={[
            { value: 'pt-BR', label: t('settings.langPt') },
            { value: 'en', label: t('settings.langEn') },
          ]}
        />
        </div>
      </section>

      <h2 className="sec-h">{t('settings.progress')}</h2>
      <InsetGroup>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('settings.path')}</span>
            <span className="hint">
              <PathProgressSwitcher compact />
            </span>
          </div>
        </div>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('progress.pathProgress')}</span>
            <span className="hint">
              <ProgressSummaryLine />
            </span>
          </div>
        </div>
        <div className="row" style={{ display: 'block', minHeight: 0 }}>
          <div className="lbl-row">
            <span className="lbl">{t('settings.completedRebirths', { n: progress.completedOnPath })}</span>
            <span className="val">{progress.completedOnPath}</span>
          </div>
          <input
            type="range"
            className="range"
            min={0}
            max={40}
            value={progress.completedOnPath}
            style={{ ['--p' as string]: `${(progress.completedOnPath / 40) * 100}%` }}
            aria-label={t('settings.completedRebirths', { n: progress.completedOnPath })}
            onChange={(e) => {
              const completed = Number(e.target.value)
              setProgress(completed + 1, completed)
            }}
          />
          <div className="range-scale">
            <span>0</span>
            <span>40</span>
          </div>
        </div>
      </InsetGroup>

      <h2 className="sec-h">{t('settings.dataSection')}</h2>
      <InsetGroup footer={t('settings.updateHint')}>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('settings.gameData')}</span>
            <span className="hint">
              {`v${meta.dataVersion} · ${meta.gameVersion}`}
              {stale ? ` · ${t('settings.dataStaleShort')}` : ` · ${t('settings.dataFresh')}`}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="row row row--link"
          onClick={() => downloadJson('droid-tycoon-progress.json', exportProgress(toPersisted()))}
        >
          <div className="row-main">
            <span className="row-title">{t('settings.exportShort')}</span>
          </div>
          <DownloadSimple {...uiIconProps} className="row-val shrink-0 opacity-60" />
        </button>
        <button
          type="button"
          className="row row row--link"
          data-testid="settings-import-trigger"
          onClick={() => fileRef.current?.click()}
        >
          <div className="row-main">
            <span className="row-title">{t('settings.importShort')}</span>
          </div>
          <UploadSimple {...uiIconProps} className="row-val shrink-0 opacity-60" />
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

      <h2 className="sec-h">{t('shareExport.title')}</h2>
      <InsetGroup footer={t('shareExport.footer')} testId="share-export-card">
        <button type="button" className="row row row--link" data-testid="share-app" onClick={() => void shareApp()}>
          <div className="row-main">
            <span className="row-title">{t('share.shareApp')}</span>
          </div>
          <LinkSimple {...uiIconProps} className="shrink-0 opacity-60" />
        </button>
        <button type="button" className="row row row--link" onClick={shareWhatsApp}>
          <div className="row-main">
            <span className="row-title">{t('share.whatsapp')}</span>
          </div>
          <WhatsappLogo {...uiIconProps} className="shrink-0 opacity-60" />
        </button>
        <button
          type="button"
          className="row row row--link"
          disabled={shareBusy}
          data-testid="share-progress-card"
          onClick={() => void shareProgressImage()}
        >
          <div className="row-main">
            <span className="row-title">{t('share.progressCard')}</span>
          </div>
          <ShareNetwork {...uiIconProps} className="shrink-0 opacity-60" />
        </button>
      </InsetGroup>

      <h2 className="sec-h">{t('settings.aboutSection')}</h2>
      <InsetGroup>
        <button type="button" className="row row row--link" onClick={rerunOnboarding}>
          <div className="row-main">
            <span className="row-title">{t('settings.rerunOnboardingShort')}</span>
          </div>
        </button>
        <Link to="/about" className="row row row--link">
          <div className="row-main">
            <span className="row-title">{t('nav.about')}</span>
          </div>
        </Link>
        <div className="row">
          <FeedbackWhatsAppLink variant="link" className="text-sm" />
        </div>
      </InsetGroup>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.danger')}</h2>
        </div>
        <button
          type="button"
          className="btn btn--danger"
          data-testid="settings-reset-trigger"
          onClick={() => setResetOpen(true)}
        >
          {t('settings.resetShort')}
        </button>
      </section>

      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setPendingImport(null)
        }}
        title={t('settings.importConfirmTitle')}
        testId="modal-importar"
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

      <div aria-hidden />
    </TabScrollLayout>
  )
}
