import { motion, AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check } from '@phosphor-icons/react'
import type { AppLocale } from '../i18n/detectLocale'
import { setDocumentLanguage, initI18n } from '../i18n/index'
import { gameData } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { RadioCardGroup } from '../components/ui/RadioCardGroup'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Switch } from '../components/ui/Switch'
import { useAppStore } from '../store/useAppStore'
import { applyTheme } from '../store/useAppStore'
import type { ThemeMode } from '../storage/types'
import { uiIconProps } from '../components/ui/iconStyle'

const steps = ['welcome', 'setup', 'prefs'] as const

export function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isRerun = params.get('rerun') === '1'

  const progressStore = useAppStore((s) => s.progress)
  const settings = useAppStore((s) => s.settings)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const setPathFresh = useAppStore((s) => s.setPathFresh)
  const setProgress = useAppStore((s) => s.setProgress)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setLocale = useAppStore((s) => s.setLocale)

  const [step, setStep] = useState(0)
  const [pathId, setPathIdLocal] = useState(progressStore.pathId)
  const [completed, setCompleted] = useState(isRerun ? progressStore.completedOnPath : 0)

  const current = steps[step]!
  const cycleOptions = useMemo(
    () =>
      gameData.cycles.map((c) => ({
        value: c.id,
        label: formatCycleDisplayName(c.name, i18n.language),
      })),
    [i18n.language],
  )

  const finish = (applyProgress: boolean) => {
    if (applyProgress) {
      setPathFresh(pathId)
      setProgress(completed + 1, completed)
    }
    setOnboardingComplete(true)
    navigate('/')
  }

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

  return (
    <div className="min-h-dvh flex items-end sm:items-center justify-center p-4 pb-8">
      <GlassCard className="w-full max-w-md p-5 sm:p-6">
        <div className="flex gap-1 mb-4">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-holo-500' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {current === 'welcome' ? (
              <>
                <div className="flex flex-col items-center text-center gap-2 py-2">
                  <Logo className="h-14 w-14" />
                  <h1 className="font-display text-xl tracking-wide text-gradient-holo text-balance">
                    {t('onboarding.welcomeTitle')}
                  </h1>
                  <p className="text-xs text-zinc-500 text-pretty max-w-xs">{t('onboarding.welcomeBody')}</p>
                </div>
                <Button
                  className="w-full"
                  data-testid="onboarding-start"
                  icon={<ArrowRight {...uiIconProps} />}
                  onClick={() => setStep(1)}
                >
                  {t('onboarding.start')}
                </Button>
                <Button variant="ghost" className="w-full" data-testid="onboarding-skip" onClick={() => finish(false)}>
                  {t('onboarding.skip')}
                </Button>
              </>
            ) : null}

            {current === 'setup' ? (
              <>
                <h2 className="font-display text-base text-balance">{t('onboarding.choosePath')}</h2>
                <RadioCardGroup
                  ariaLabel={t('onboarding.choosePath')}
                  value={pathId}
                  onChange={setPathIdLocal}
                  options={cycleOptions}
                />
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span>{t('onboarding.progressHintShort')}</span>
                    <span className="text-zinc-300 font-medium tabular-nums">{completed}/40</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={completed}
                    onChange={(e) => setCompleted(Number(e.target.value))}
                    className="w-full accent-holo-500"
                    data-testid="onboarding-rebirth-input"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => setStep(0)}>
                    {t('onboarding.back')}
                  </Button>
                  <Button className="flex-1" size="sm" onClick={() => setStep(2)}>
                    {t('onboarding.continue')}
                  </Button>
                </div>
              </>
            ) : null}

            {current === 'prefs' ? (
              <>
                <h2 className="font-display text-base">{t('onboarding.prefsTitle')}</h2>
                <SegmentedControl
                  ariaLabel={t('settings.language')}
                  value={settings.locale}
                  onChange={changeLanguage}
                  options={[
                    { value: 'pt-BR', label: '🇧🇷 PT' },
                    { value: 'en', label: '🇺🇸 EN' },
                  ]}
                />
                <SegmentedControl
                  ariaLabel={t('settings.theme')}
                  value={settings.theme}
                  onChange={setTheme}
                  options={[
                    { value: 'dark', label: t('settings.themeDark') },
                    { value: 'light', label: t('settings.themeLight') },
                    { value: 'system', label: t('settings.themeSystemShort') },
                  ]}
                />
                <Switch
                  label={t('settings.trackInventory')}
                  checked={settings.trackInventory}
                  onChange={(v) => updateSettings({ trackInventory: v })}
                />
                <Switch
                  label={t('settings.animations')}
                  checked={settings.animationsEnabled}
                  onChange={(v) => updateSettings({ animationsEnabled: v })}
                />
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                    {t('onboarding.back')}
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    icon={<Check {...uiIconProps} />}
                    onClick={() => finish(true)}
                  >
                    {t('onboarding.finish')}
                  </Button>
                </div>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}
