import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Export,
  Storefront,
  TreeStructure,
} from '@phosphor-icons/react'
import type { AppLocale } from '../i18n/detectLocale'
import { setDocumentLanguage, initI18n } from '../i18n/index'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { DroidImage } from '../components/DroidImage'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { Switch } from '../components/ui/Switch'
import { useAppStore } from '../store/useAppStore'
import { uiIconProps } from '../components/ui/iconStyle'
import { cn } from '../lib/utils'

const STEPS = ['welcome', 'cycle', 'progress', 'features'] as const
const REBIRTHS_PER_PATH = 40

function usePrefersReducedMotion() {
  const reduced = useReducedMotion()
  return reduced ?? false
}

function cycleHeroDroidId(pathId: string): string {
  const entry = getRebirth(pathId, 1)
  return entry?.requirements[0]?.droidId ?? 'r2-d2'
}

export function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isRerun = params.get('rerun') === '1'
  const reducedMotion = usePrefersReducedMotion()

  const progressStore = useAppStore((s) => s.progress)
  const settings = useAppStore((s) => s.settings)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const setPathFresh = useAppStore((s) => s.setPathFresh)
  const setProgress = useAppStore((s) => s.setProgress)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setLocale = useAppStore((s) => s.setLocale)

  const [step, setStep] = useState(0)
  const [pathId, setPathId] = useState(progressStore.pathId)
  const [completed, setCompleted] = useState(isRerun ? progressStore.completedOnPath : 0)
  const touchStartX = useRef<number | null>(null)

  const current = STEPS[step]!
  const nextRebirth = Math.min(completed + 1, REBIRTHS_PER_PATH)
  const preview = getRebirth(pathId, nextRebirth)
  const cycle = cycleById.get(pathId)

  const changeLanguage = (locale: AppLocale) => {
    setLocale(locale, 'user')
    void initI18n(locale)
    setDocumentLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  const finish = useCallback(() => {
    setPathFresh(pathId)
    setProgress(completed + 1, completed)
    setOnboardingComplete(true)
    navigate('/')
  }, [completed, navigate, pathId, setOnboardingComplete, setPathFresh, setProgress])

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current
    if (start == null) return
    const dx = (e.changedTouches[0]?.clientX ?? start) - start
    if (dx < -48 && step < STEPS.length - 1) goNext()
    if (dx > 48 && step > 0) goBack()
    touchStartX.current = null
  }

  const transition = reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }

  const heroDroids = useMemo(
    () =>
      ['r2-d2', 'bb-8', 'cb'].map((id) => droidById.get(id)).filter(Boolean) as NonNullable<
        ReturnType<typeof droidById.get>
      >[],
    [],
  )

  return (
    <div
      className="min-h-dvh relative flex flex-col bg-surface-950 text-zinc-100 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(51,128,255,0.35), transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-lg flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex gap-1.5 flex-1" role="tablist" aria-label={t('onboarding.stepProgress')}>
            {STEPS.map((_, i) => (
              <span
                key={STEPS[i]}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i <= step ? 'bg-holo-500' : 'bg-white/10',
                )}
              />
            ))}
          </div>
          {current === 'welcome' ? (
            <div
              className="flex rounded-full border border-white/15 bg-white/5 p-0.5 text-[11px] shrink-0"
              data-testid="onboarding-lang-pill"
            >
              {(['pt-BR', 'en'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={cn(
                    'px-2.5 py-1 rounded-full min-h-8 min-w-[2.75rem]',
                    settings.locale === loc ? 'bg-holo-600 text-white' : 'text-zinc-400',
                  )}
                  onClick={() => changeLanguage(loc)}
                >
                  {loc === 'pt-BR' ? 'PT' : 'EN'}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="text-xs text-zinc-500 hover:text-zinc-300 min-h-11 px-2"
              data-testid="onboarding-skip"
              onClick={() => {
                setOnboardingComplete(true)
                navigate('/')
              }}
            >
              {t('onboarding.skip')}
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={reducedMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
              transition={transition}
              className="space-y-5"
            >
              {current === 'welcome' ? (
                <>
                  <div className="relative flex flex-col items-center text-center gap-4 py-2">
                    <motion.div
                      className="relative"
                      animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    >
                      <Logo className="h-20 w-20 drop-shadow-[0_0_24px_rgba(51,128,255,0.45)]" />
                    </motion.div>
                    <div className="flex -space-x-3">
                      {heroDroids.map((d) => (
                        <DroidImage key={d.id} droid={d} size="md" className="ring-2 ring-surface-950" />
                      ))}
                    </div>
                    <div>
                      <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-gradient-holo text-balance">
                        {t('onboarding.welcomeHeadline')}
                      </h1>
                      <p className="text-sm text-zinc-400 mt-2 text-pretty max-w-xs mx-auto">
                        {t('onboarding.welcomeSub')}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}

              {current === 'cycle' ? (
                <>
                  <div>
                    <h2 className="font-display text-xl text-balance">{t('onboarding.choosePath')}</h2>
                    <p className="text-xs text-zinc-500 mt-1">{t('onboarding.cycleHint')}</p>
                  </div>
                  <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1 -mr-1">
                    {gameData.cycles.map((c) => {
                      const selected = pathId === c.id
                      const heroId = cycleHeroDroidId(c.id)
                      const hero = droidById.get(heroId)
                      const rebirthCount = c.rebirths.length
                      return (
                        <button
                          key={c.id}
                          type="button"
                          data-testid={`onboarding-cycle-${c.id}`}
                          onClick={() => setPathId(c.id)}
                          className={cn(
                            'flex items-center gap-3 rounded-2xl border p-3 text-left min-h-[4.75rem] transition-all',
                            selected
                              ? 'border-holo-400 ring-2 ring-holo-500/40 bg-holo-600/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/8',
                          )}
                        >
                          {hero ? (
                            <DroidImage droid={hero} size="md" className="shrink-0" />
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">
                              {formatCycleDisplayName(c.name, i18n.language)}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {t('onboarding.rebirthCount', { n: rebirthCount })}
                            </p>
                          </div>
                          {selected ? (
                            <CheckCircle {...uiIconProps} className="text-holo-400 shrink-0" weight="fill" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : null}

              {current === 'progress' ? (
                <>
                  <div>
                    <h2 className="font-display text-xl text-balance">{t('onboarding.progressTitle')}</h2>
                    <p className="text-xs text-zinc-500 mt-1">{t('onboarding.progressHint')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: t('onboarding.chipStart'), value: 0 },
                      { label: t('onboarding.chipMid'), value: 20 },
                    ].map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        className={cn(
                          'rounded-full px-4 py-2 text-sm min-h-11 border',
                          completed === chip.value
                            ? 'border-holo-400 bg-holo-600/20 text-holo-200'
                            : 'border-white/15 bg-white/5 text-zinc-300',
                        )}
                        onClick={() => setCompleted(chip.value)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label={t('onboarding.decrease')}
                        className="min-h-11 min-w-11"
                        onClick={() => setCompleted((v) => Math.max(0, v - 1))}
                      >
                        −
                      </Button>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                          {t('onboarding.progressHintShort')}
                        </p>
                        <p className="font-display text-5xl tabular-nums text-holo-300">{completed}</p>
                        <p className="text-xs text-zinc-500">
                          {t('onboarding.progressNext', { n: nextRebirth })}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label={t('onboarding.increase')}
                        className="min-h-11 min-w-11"
                        onClick={() => setCompleted((v) => Math.min(REBIRTHS_PER_PATH, v + 1))}
                      >
                        +
                      </Button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={REBIRTHS_PER_PATH}
                      value={completed}
                      onChange={(e) => setCompleted(Number(e.target.value))}
                      className="w-full accent-holo-500 min-h-11"
                      data-testid="onboarding-rebirth-input"
                    />
                  </div>
                  {preview && cycle ? (
                    <div className="rounded-xl border border-white/10 p-3 space-y-2">
                      <p className="text-xs font-medium text-zinc-400">
                        {t('onboarding.nextReqPreview', { n: nextRebirth })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {preview.requirements.map((req) => {
                          const d = droidById.get(req.droidId)
                          if (!d) return null
                          return (
                            <div key={req.droidId} className="flex items-center gap-1.5 text-xs">
                              <DroidImage droid={d} size="sm" />
                              <span>{d.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {current === 'features' ? (
                <>
                  <div>
                    <h2 className="font-display text-xl text-balance">{t('onboarding.featuresTitle')}</h2>
                    <p className="text-xs text-zinc-500 mt-1">{t('onboarding.featuresHint')}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: TreeStructure, label: t('nav.progress') },
                      { icon: Storefront, label: t('nav.sell') },
                      { icon: Export, label: t('onboarding.featureExport') },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col items-center gap-2 text-center min-h-[5.5rem] justify-center"
                      >
                        <Icon {...uiIconProps} className="text-holo-400" />
                        <span className="text-[11px] font-medium leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                  <Switch
                    label={t('settings.trackInventory')}
                    checked={settings.trackInventory}
                    onChange={(v) => updateSettings({ trackInventory: v })}
                  />
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex gap-2 pt-4 mt-auto">
          {step > 0 ? (
            <Button
              variant="secondary"
              className="min-h-11"
              data-testid="onboarding-back"
              icon={<ArrowLeft {...uiIconProps} />}
              onClick={goBack}
            >
              {t('onboarding.back')}
            </Button>
          ) : null}
          {current === 'welcome' ? (
            <>
              <Button
                className="flex-1 min-h-11"
                data-testid="onboarding-start"
                icon={<ArrowRight {...uiIconProps} />}
                onClick={goNext}
              >
                {t('onboarding.start')}
              </Button>
              <Button
                variant="ghost"
                className="min-h-11 shrink-0"
                data-testid="onboarding-skip"
                onClick={() => {
                  setOnboardingComplete(true)
                  navigate('/')
                }}
              >
                {t('onboarding.skip')}
              </Button>
            </>
          ) : step < STEPS.length - 1 ? (
            <Button
              className="flex-1 min-h-11"
              data-testid="onboarding-next"
              icon={<ArrowRight {...uiIconProps} />}
              onClick={goNext}
            >
              {t('onboarding.continue')}
            </Button>
          ) : (
            <Button
              className="flex-1 min-h-11"
              data-testid="onboarding-finish"
              icon={<Check {...uiIconProps} />}
              onClick={finish}
            >
              {t('onboarding.ctaStart')}
            </Button>
          )}
        </div>
      </div>

      <div className="hidden sm:flex fixed inset-0 -z-10 items-center justify-center pointer-events-none">
        <div className="w-full max-w-md mx-auto h-[min(720px,90vh)] rounded-3xl border border-white/5 bg-surface-900/30 backdrop-blur-sm" />
      </div>
    </div>
  )
}
