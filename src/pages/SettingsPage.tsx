import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ShareMenu } from '../components/ShareMenu'
import { DownloadCycleMenu } from '../components/DownloadCycleMenu'
import { FeedbackWhatsAppLink } from '../components/FeedbackWhatsAppLink'
import { gameDataSource } from '../data/dataSource'
import { gameData } from '../domain/gameData'
import type { AppLocale } from '../i18n/detectLocale'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore, applyTheme } from '../store/useAppStore'
import { downloadJson, exportProgress, parseImportJson } from '../storage/exportImport'
import { useToast } from '../components/ToastProvider'
import { setDocumentLanguage } from '../i18n'
import { initI18n } from '../i18n/index'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { push } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const settings = useAppStore((s) => s.settings)
  const progress = useAppStore((s) => s.progress)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setProgress = useAppStore((s) => s.setProgress)
  const setLocale = useAppStore((s) => s.setLocale)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
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

  return (
    <div className="space-y-5 max-w-2xl pb-8">
      <h1 className="font-display text-2xl tracking-wide">{t('settings.title')}</h1>

      <GlassCard className="space-y-4">
        <h2 className="font-medium">{t('settings.appearance')}</h2>
        <label className="flex justify-between text-sm items-center gap-4">
          {t('settings.language')}
          <select
            className="rounded-lg bg-surface-800 border border-white/10 px-2 py-1"
            value={settings.locale}
            onChange={(e) => changeLanguage(e.target.value as AppLocale)}
            data-testid="language-select"
          >
            <option value="en">{t('settings.langEn')}</option>
            <option value="pt-BR">{t('settings.langPt')}</option>
          </select>
        </label>
        <label className="flex justify-between text-sm items-center gap-4">
          {t('settings.theme')}
          <select
            className="rounded-lg bg-surface-800 border border-white/10 px-2 py-1"
            value={settings.theme}
            onChange={(e) => {
              const theme = e.target.value as typeof settings.theme
              updateSettings({ theme })
              applyTheme(theme)
            }}
          >
            <option value="dark">{t('settings.themeDark')}</option>
            <option value="light">{t('settings.themeLight')}</option>
            <option value="system">{t('settings.themeSystem')}</option>
          </select>
        </label>
        <label className="flex justify-between text-sm items-center">
          {t('settings.animations')}
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
          />
        </label>
        <label className="flex justify-between text-sm items-center">
          {t('settings.trackInventory')}
          <input
            type="checkbox"
            checked={settings.trackInventory}
            onChange={(e) => updateSettings({ trackInventory: e.target.checked })}
          />
        </label>
        <Button variant="secondary" onClick={() => navigate('/onboarding')}>
          {t('settings.rerunOnboarding')}
        </Button>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-medium">{t('settings.progress')}</h2>
        <PathProgressSwitcher />
        <ProgressSummaryLine />
        <label className="block text-sm">
          {t('settings.completedRebirths', { n: progress.completedOnPath })}
          <input
            type="range"
            min={0}
            max={40}
            value={progress.completedOnPath}
            className="w-full mt-2"
            onChange={(e) => {
              const completed = Number(e.target.value)
              setProgress(completed + 1, completed)
            }}
          />
        </label>
      </GlassCard>

      <GlassCard className="space-y-2 text-sm">
        <h2 className="font-medium">{t('settings.gameData')}</h2>
        <p>
          v{meta.dataVersion} · {meta.gameVersion} · {meta.lastUpdated}
        </p>
        {stale ? (
          <Badge tone="warn">{t('settings.dataStale', { days: gameData.staleAfterDays })}</Badge>
        ) : (
          <Badge tone="success">{t('settings.dataFresh')}</Badge>
        )}
        <p className="text-xs text-zinc-500">{t('settings.updateHint')}</p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-medium">{t('settings.backup')}</h2>
        <Button
          variant="secondary"
          onClick={() => downloadJson('droid-tycoon-progress.json', exportProgress(toPersisted()))}
        >
          {t('settings.export')}
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          {t('settings.import')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const text = await file.text()
            const result = parseImportJson(text)
            if (!result.ok) {
              push(t('settings.importFail'))
              return
            }
            importState(result.state)
            push(t('settings.importOk'))
          }}
        />
      </GlassCard>

      <GlassCard className="text-xs text-zinc-500 space-y-2">
        <h2 className="font-medium text-zinc-300 text-sm">{t('settings.credits')}</h2>
        <p>{t('settings.creditsBody')}</p>
        <p className="pt-2 border-t border-white/10">{t('app.disclaimer')}</p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-medium text-sm">{t('feedback.settingsTitle')}</h2>
        <p className="text-xs text-zinc-400">{t('feedback.settingsHint')}</p>
        <FeedbackWhatsAppLink />
      </GlassCard>

      <DownloadCycleMenu />
      <ShareMenu compact />

      <GlassCard className="space-y-2 text-sm">
        <Link to="/about" className="text-holo-300 hover:underline inline-flex min-h-11 items-center">
          {t('nav.about')} →
        </Link>
      </GlassCard>

      <GlassCard className="space-y-3 border border-red-500/30 bg-red-950/20 mt-8">
        <h2 className="font-medium text-red-300">{t('settings.danger')}</h2>
        <p className="text-xs text-zinc-400">{t('settings.reset')} — removes all local progress.</p>
        {!confirmReset ? (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            {t('settings.reset')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                resetAll()
                setOnboardingComplete(false)
                push(t('settings.resetDone'))
                navigate('/onboarding')
              }}
            >
              {t('settings.resetConfirm')}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t('path.cancel')}
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
