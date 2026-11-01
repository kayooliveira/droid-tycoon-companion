import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import {
  Database,
  DownloadSimple,
  GlobeHemisphereWest,
  Info,
  Moon,
  Palette,
  ArrowCounterClockwise,
  Trash,
  UploadSimple,
} from '@phosphor-icons/react'
import { ShareExportCard } from '../components/ShareExportCard'
import { FeedbackWhatsAppLink } from '../components/FeedbackWhatsAppLink'
import { PathProgressSwitcher, ProgressSummaryLine } from '../components/PathProgressSwitcher'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Switch } from '../components/ui/Switch'
import { HelpHint } from '../components/ui/HelpHint'
import { gameDataSource } from '../data/dataSource'
import type { AppLocale } from '../i18n/detectLocale'
import { useAppStore, applyTheme } from '../store/useAppStore'
import type { ThemeMode } from '../storage/types'
import { downloadJson, exportProgress, parseImportJson } from '../storage/exportImport'
import { useToast } from '../components/ToastProvider'
import { setDocumentLanguage } from '../i18n'
import { initI18n } from '../i18n/index'
import { uiIconProps } from '../components/ui/iconStyle'

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

  return (
    <div className="space-y-4 max-w-2xl pb-10">
      <h1 className="font-display text-xl tracking-wide text-balance">{t('settings.title')}</h1>

      <GlassCard className="p-4">
        <SectionHeader icon={<Palette {...uiIconProps} />} title={t('settings.appearance')} />
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">{t('settings.theme')}</p>
            <SegmentedControl
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
          <Switch
            label={t('settings.animations')}
            checked={settings.animationsEnabled}
            onChange={(v) => updateSettings({ animationsEnabled: v })}
          />
          <Switch
            label={t('settings.trackInventory')}
            checked={settings.trackInventory}
            onChange={(v) => updateSettings({ trackInventory: v })}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <SectionHeader
          icon={<GlobeHemisphereWest {...uiIconProps} />}
          title={t('settings.language')}
        />
        <div data-testid="language-select">
          <SegmentedControl
            ariaLabel={t('settings.language')}
            value={settings.locale}
            onChange={changeLanguage}
            options={[
              { value: 'pt-BR', label: '🇧🇷 PT' },
              { value: 'en', label: '🇺🇸 EN' },
            ]}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <SectionHeader icon={<ArrowCounterClockwise {...uiIconProps} />} title={t('settings.progress')} />
        <PathProgressSwitcher compact />
        <ProgressSummaryLine />
        <label className="block text-xs text-zinc-500">
          {t('settings.completedRebirths', { n: progress.completedOnPath })}
          <input
            type="range"
            min={0}
            max={40}
            value={progress.completedOnPath}
            className="w-full mt-2 accent-holo-500"
            onChange={(e) => {
              const completed = Number(e.target.value)
              setProgress(completed + 1, completed)
            }}
          />
        </label>
      </GlassCard>

      <GlassCard className="p-4">
        <SectionHeader
          icon={<Database {...uiIconProps} />}
          title={t('settings.dataSection')}
          action={<HelpHint label={t('settings.dataHelp')} text={t('settings.updateHint')} />}
        />
        <p className="text-xs text-zinc-500 mb-3">
          v{meta.dataVersion} · {meta.gameVersion}
          {stale ? (
            <Badge tone="warn" className="ml-2">
              {t('settings.dataStaleShort')}
            </Badge>
          ) : (
            <Badge tone="success" className="ml-2">
              {t('settings.dataFresh')}
            </Badge>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<DownloadSimple {...uiIconProps} />}
            onClick={() => downloadJson('droid-tycoon-progress.json', exportProgress(toPersisted()))}
          >
            {t('settings.exportShort')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<UploadSimple {...uiIconProps} />}
            onClick={() => fileRef.current?.click()}
          >
            {t('settings.importShort')}
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
        </div>
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <SectionHeader icon={<Info {...uiIconProps} />} title={t('settings.aboutSection')} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={rerunOnboarding}>
            {t('settings.rerunOnboardingShort')}
          </Button>
          <Link to="/about">
            <Button variant="ghost" size="sm">
              {t('nav.about')}
            </Button>
          </Link>
        </div>
        <FeedbackWhatsAppLink />
      </GlassCard>

      <ShareExportCard />

      <GlassCard className="p-4 border border-red-500/25 bg-red-950/15">
        <SectionHeader
          icon={<Trash {...uiIconProps} />}
          title={t('settings.danger')}
        />
        {!confirmReset ? (
          <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
            {t('settings.resetShort')}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetAll()
                push(t('settings.resetDone'))
                navigate('/onboarding')
              }}
            >
              {t('settings.resetConfirm')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
              {t('path.cancel')}
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
