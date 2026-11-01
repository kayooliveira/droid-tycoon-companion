import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { AppLocale } from '../i18n/detectLocale'
import { setDocumentLanguage, initI18n } from '../i18n/index'
import { gameData } from '../domain/gameData'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore } from '../store/useAppStore'

const steps = ['welcome', 'path', 'progress', 'prefs', 'done'] as const

export function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const setPathFresh = useAppStore((s) => s.setPathFresh)
  const setProgress = useAppStore((s) => s.setProgress)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setLocale = useAppStore((s) => s.setLocale)
  const settings = useAppStore((s) => s.settings)

  const [pathId, setPathIdLocal] = useState('path-1')
  const [completed, setCompleted] = useState(0)

  const current = steps[step]!

  const finish = () => {
    setPathFresh(pathId)
    setProgress(completed + 1, completed)
    setOnboardingComplete(true)
    navigate('/')
  }

  const changeLanguage = (locale: AppLocale) => {
    setLocale(locale, 'user')
    void initI18n(locale)
    setDocumentLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {current === 'welcome' ? (
              <>
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <Logo className="h-16 w-16" />
                  <h1 className="font-display text-2xl tracking-wide text-gradient-holo">
                    {t('onboarding.welcomeTitle')}
                  </h1>
                  <p className="text-sm text-zinc-400 max-w-md">{t('onboarding.welcomeBody')}</p>
                </div>
                <Button className="w-full" data-testid="onboarding-start" onClick={() => setStep(1)}>
                  {t('onboarding.start')}
                </Button>
                <Button variant="ghost" className="w-full" data-testid="onboarding-skip" onClick={finish}>
                  {t('onboarding.skip')}
                </Button>
              </>
            ) : null}

            {current === 'path' ? (
              <>
                <h2 className="font-display text-lg">{t('onboarding.choosePath')}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {gameData.cycles.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPathIdLocal(c.id)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                        pathId === c.id
                          ? 'border-holo-400/50 bg-holo-600/15'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <p className="font-medium">{c.name}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(0)}>
                    {t('onboarding.back')}
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(2)}>
                    {t('onboarding.continue')}
                  </Button>
                </div>
              </>
            ) : null}

            {current === 'progress' ? (
              <>
                <h2 className="font-display text-lg">{t('onboarding.progressTitle')}</h2>
                <p className="text-sm text-zinc-400">{t('onboarding.progressHint')}</p>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={completed}
                  onChange={(e) => setCompleted(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-zinc-400">{t('settings.completedRebirths', { n: completed })}</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={completed}
                    onChange={(e) =>
                      setCompleted(Math.min(40, Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="w-20 rounded-lg bg-surface-800 border border-white/10 px-2 py-1 text-center"
                    data-testid="onboarding-rebirth-input"
                  />
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  {t('onboarding.progressNext', { n: completed + 1 })}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    {t('onboarding.back')}
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    {t('onboarding.continue')}
                  </Button>
                </div>
              </>
            ) : null}

            {current === 'prefs' ? (
              <>
                <h2 className="font-display text-lg">{t('onboarding.prefsTitle')}</h2>
                <label className="flex items-center justify-between gap-3 text-sm">
                  {t('onboarding.language')}
                  <select
                    className="rounded-lg bg-surface-800 border border-white/10 px-2 py-1"
                    value={settings.locale}
                    onChange={(e) => changeLanguage(e.target.value as AppLocale)}
                  >
                    <option value="en">{t('settings.langEn')}</option>
                    <option value="pt-BR">{t('settings.langPt')}</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  {t('onboarding.theme')}
                  <select
                    className="rounded-lg bg-surface-800 border border-white/10 px-2 py-1"
                    value={settings.theme}
                    onChange={(e) =>
                      updateSettings({ theme: e.target.value as typeof settings.theme })
                    }
                  >
                    <option value="dark">{t('settings.themeDark')}</option>
                    <option value="light">{t('settings.themeLight')}</option>
                    <option value="system">{t('settings.themeSystem')}</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  {t('onboarding.trackInventory')}
                  <input
                    type="checkbox"
                    checked={settings.trackInventory}
                    onChange={(e) => updateSettings({ trackInventory: e.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  {t('onboarding.animations')}
                  <input
                    type="checkbox"
                    checked={settings.animationsEnabled}
                    onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
                  />
                </label>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    {t('onboarding.back')}
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(4)}>
                    {t('onboarding.finish')}
                  </Button>
                </div>
              </>
            ) : null}

            {current === 'done' ? (
              <>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 space-y-3"
                >
                  <Logo className="h-14 w-14 mx-auto" />
                  <h2 className="font-display text-xl text-gradient-holo">{t('onboarding.doneTitle')}</h2>
                  <p className="text-sm text-zinc-400">{t('onboarding.doneBody')}</p>
                </motion.div>
                <Button className="w-full" onClick={finish}>
                  {t('onboarding.openDashboard')}
                </Button>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}
