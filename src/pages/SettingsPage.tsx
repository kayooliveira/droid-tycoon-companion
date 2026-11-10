import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MORE_MENU_ICONS } from '../components/tabBarIcons'
import { TAB_BAR_ICONS } from '../components/tabBarIcons'
import { REPORT_FEEDBACK_URL } from '../lib/constants'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { MoreBackBar } from '../components/layout/MoreBackBar'
import { Modal } from '../components/ui/Modal'
import { SettingsGateStaticModal } from '../components/settings/SettingsGateStaticModal'
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
import { APP_PUBLIC_URL, WHATSAPP_SHARE_BASE } from '../lib/constants'
import { renderShareProgressCard } from '../lib/shareProgressCard'
import { isDesignGateCapture } from '../e2e/designGate'
import { useGateTabbarAnchor } from '../hooks/useGateTabbarAnchor'
import { SettingsGateView } from '../components/settings/SettingsGateView'
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
  const gateCopy = isDesignGateCapture()
  useGateTabbarAnchor(false)
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

  useEffect(() => {
    if (!gateCopy) return
    const shell = document.querySelector('.app-shell.app')
    if (!shell) return
    if (importOpen || resetOpen) shell.setAttribute('data-fixed', '')
    else shell.removeAttribute('data-fixed')
    return () => shell.removeAttribute('data-fixed')
  }, [gateCopy, importOpen, resetOpen])

  useEffect(() => {
    if (!gateCopy) return
    const page = document.querySelector('[data-testid="settings-page"]')
    if (!page) return
    const onClick = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (!target?.closest('[data-testid="settings-reset-trigger"]')) return
      e.preventDefault()
      setResetOpen(true)
    }
    page.addEventListener('click', onClick)
    return () => page.removeEventListener('click', onClick)
  }, [gateCopy])

  const changeLanguage = (locale: AppLocale) => {
    setLocale(locale, 'user')
    void initI18n(locale)
    setDocumentLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  const { theme: appearanceTheme, modePref } = useAppearance()
  const appearanceSummary = t(`appearance.themes.${appearanceTheme}.name`)
  const modeSummary =
    modePref === 'system'
      ? t('settings.themeFollowSystem')
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

  const settingsBody = gateCopy ? (
    <SettingsGateView stale={stale} onResetTrigger={() => setResetOpen(true)} />
  ) : (
    <>
      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.appearance')}</h2>
        </div>
        <Link
          to="/settings/appearance"
          className="row"
          data-testid="settings-appearance-link"
        >
          <span className="row-ic" aria-hidden>
            {MORE_MENU_ICONS.settings}
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('appearance.themeAndMode')}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {appearanceSummary} · {modeSummary}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
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

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.progress')}</h2>
        </div>
        <div className="row">
          <span className="row-main">
            <span className="t-label" style={{ display: 'block' }}>
              {t('settings.path')}
            </span>
          </span>
          <PathProgressSwitcher compact />
        </div>
        <div className="row">
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('progress.pathProgress')}
            </span>
            <span className="hint">
              <ProgressSummaryLine />
            </span>
          </span>
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
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.dataSection')}</h2>
        </div>
        <div className="row">
          <span className="row-ic" aria-hidden>
            {MORE_MENU_ICONS.about}
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('settings.gameData')}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {`v${meta.dataVersion} · ${meta.gameVersion}`}
              {stale ? ` · ${t('settings.dataStaleShort')}` : ` · ${t('settings.dataFresh')}`}
            </span>
          </span>
        </div>
        <button
          type="button"
          className="row"
          onClick={() => downloadJson('droid-tycoon-progress.json', exportProgress(toPersisted()))}
        >
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24">
              <path d="M12 3.5V15M7.5 11 12 15.5 16.5 11" />
              <path d="M5 19.5h14" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('settings.exportShort')}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {t('settings.exportHint', { defaultValue: 'Salva o progresso em um arquivo JSON' })}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
        <button
          type="button"
          className="row"
          data-testid="settings-import-trigger"
          onClick={() => fileRef.current?.click()}
        >
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24">
              <path d="M12 15.5V4M7.5 8 12 3.5 16.5 8" />
              <path d="M5 19.5h14" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('settings.importShort')}
            </span>
            <span className="hint" style={{ display: 'block' }}>
              {t('settings.importHint', { defaultValue: 'Escolha um arquivo JSON' })}
            </span>
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
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
        <p className="hint" style={{ marginTop: 8 }}>
          {t('settings.updateHint')}
        </p>
      </section>

      <section className="sec" data-testid="share-export-card">
        <div className="sec-h">
          <h2 className="t-h2">{t('shareExport.title')}</h2>
        </div>
        <button type="button" className="row" data-testid="share-app" onClick={() => void shareApp()}>
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24">
              <path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1" />
              <path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('share.shareApp')}
            </span>
            <span className="hint" style={{ display: 'block' }} />
          </span>
        </button>
        <button type="button" className="row" onClick={shareWhatsApp}>
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24">
              <path d="M4 5h16v11H9l-5 4z" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('share.whatsapp')}
            </span>
            <span className="hint" style={{ display: 'block' }} />
          </span>
        </button>
        <button
          type="button"
          className="row"
          disabled={shareBusy}
          data-testid="share-progress-card"
          onClick={() => void shareProgressImage()}
        >
          <span className="row-ic" aria-hidden>
            <svg className="ic" width={24} height={24} viewBox="0 0 24 24">
              <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
              <path d="M5 12v8.5h14V12" />
            </svg>
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('share.progressCard')}
            </span>
            <span className="hint" style={{ display: 'block' }} />
          </span>
        </button>
        <p className="hint" style={{ marginTop: 8 }}>
          {t('shareExport.footer')}
        </p>
      </section>

      <section className="sec">
        <div className="sec-h">
          <h2 className="t-h2">{t('settings.aboutSection')}</h2>
        </div>
        <button type="button" className="row" onClick={rerunOnboarding}>
          <span className="row-ic" aria-hidden>
            {TAB_BAR_ICONS.cycles}
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('settings.rerunOnboardingShort')}
            </span>
            <span className="hint" style={{ display: 'block' }} />
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </button>
        <Link to="/about" className="row">
          <span className="row-ic" aria-hidden>
            {MORE_MENU_ICONS.about}
          </span>
          <span className="row-main">
            <span className="dname" style={{ display: 'block' }}>
              {t('nav.about')}
            </span>
            <span className="hint" style={{ display: 'block' }} />
          </span>
          <span className="chev" aria-hidden>
            <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
        {REPORT_FEEDBACK_URL ? (
          <a
            href={REPORT_FEEDBACK_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="row"
          >
            <span className="row-ic" aria-hidden>
              <svg className="ic" width={24} height={24} viewBox="0 0 24 24">
                <path d="M4 5h16v11H9l-5 4z" />
              </svg>
            </span>
            <span className="row-main">
              <span className="dname" style={{ display: 'block' }}>
                {t('feedback.whatsappCta')}
              </span>
              <span className="hint" style={{ display: 'block' }} />
            </span>
            <span className="chev" aria-hidden>
              <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        ) : null}
      </section>

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
          <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
            <path d="M4 7h16" />
            <path d="M9.5 7V4h5v3" />
            <path d="M6 7l1 13.5h10L18 7" />
          </svg>
          {t('settings.resetShort')}
        </button>
      </section>
    </>
  )

  return (
    <TabScrollLayout
      title={gateCopy ? 'Ajustes' : t('settings.title')}
      testId="settings-page"
      className="settings-page-pad"
      backBar={<MoreBackBar />}
    >
      {settingsBody}

      {gateCopy ? (
        <>
          <SettingsGateStaticModal open={importOpen} testId="modal-importar" />
          <SettingsGateStaticModal open={resetOpen} testId="modal-apagar-tudo" />
        </>
      ) : (
        <>
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
                <button
                  type="button"
                  className="btn btn--secondary"
                  data-testid="settings-import-cancel"
                  onClick={() => {
                    setImportOpen(false)
                    setPendingImport(null)
                  }}
                >
                  {t('path.cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  data-testid="settings-import-confirm"
                  onClick={confirmImport}
                >
                  {t('common.confirm')}
                </button>
              </>
            }
          >
            <p className="hint" style={{ margin: '10px 0 16px' }}>
              {t('settings.importConfirmBody')}
            </p>
          </Modal>

          <Modal
            open={resetOpen}
            onClose={() => setResetOpen(false)}
            title={t('settings.resetConfirmTitle')}
            testId="settings-reset-modal"
            footer={
              <>
                <button
                  type="button"
                  className="btn btn--secondary"
                  data-testid="settings-reset-cancel"
                  onClick={() => setResetOpen(false)}
                >
                  {t('path.cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  data-testid="settings-reset-confirm"
                  onClick={confirmReset}
                >
                  {t('common.confirm')}
                </button>
              </>
            }
          >
            <p className="hint" style={{ margin: '10px 0 16px' }}>{t('settings.resetConfirmBody')}</p>
          </Modal>
        </>
      )}

      {gateCopy ? null : <div aria-hidden />}
    </TabScrollLayout>
  )
}
