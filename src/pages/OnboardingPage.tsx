import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Export,
  Minus,
  Plus,
  Storefront,
  TreeStructure,
} from '@phosphor-icons/react'
import type { AppLocale } from '../i18n/detectLocale'
import { setDocumentLanguage, initI18n } from '../i18n/index'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { DroidImage } from '../components/DroidImage'
import { ONBOARDING_HERO_TIERS } from '../components/ui/tierVisuals'
import type { TierId } from '../domain/types'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { Switch } from '../components/ui/Switch'
import { useAppStore } from '../store/useAppStore'
import { uiIconProps } from '../components/ui/iconStyle'
import { cn } from '../lib/utils'

const STEPS = ['welcome', 'cycle', 'progress', 'features'] as const
const REBIRTHS_PER_PATH = 40

function cycleHeroDroidId(pathId: string): string {
  const entry = getRebirth(pathId, 1)
  return entry?.requirements[0]?.droidId ?? 'r2-d2'
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="space-y-1 shrink-0">
      <h2
        data-testid="onboarding-heading"
        className="font-display text-xl sm:text-2xl font-semibold text-ui-fg text-balance tracking-wide"
      >
        {title}
      </h2>
      <p className="text-sm text-ui-muted text-pretty">{subtitle}</p>
    </header>
  )
}

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

  const skip = useCallback(() => {
    setOnboardingComplete(true)
    navigate('/')
  }, [navigate, setOnboardingComplete])

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

  const heroDroids = useMemo(
    () =>
      ['r2-d2', 'bb-8', 'cb'].map((id) => droidById.get(id)).filter(Boolean) as NonNullable<
        ReturnType<typeof droidById.get>
      >[],
    [],
  )

  const fanStyles = [
    'z-10 -rotate-12 translate-y-2 scale-110 shadow-[0_12px_40px_rgba(51,128,255,0.35)]',
    'z-20 scale-125 shadow-[0_16px_48px_rgba(94,234,212,0.25)]',
    'z-10 rotate-12 translate-y-2 scale-110 shadow-[0_12px_40px_rgba(51,128,255,0.35)]',
  ]

  return (
    <div
      data-testid="onboarding-shell"
      className="min-h-dvh relative flex flex-col bg-ui-bg text-ui-fg overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(29,78,216,0.45), transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-lg flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-6 min-h-0">
        <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
          <div
            className="flex rounded-full border border-ui bg-ui-hover p-0.5 text-[11px] shrink-0"
            data-testid="onboarding-lang-pill"
          >
            {(['pt-BR', 'en'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                className={cn(
                  'px-2.5 py-1 rounded-full min-h-8 min-w-[2.75rem]',
                  settings.locale === loc ? 'bg-holo-600 text-on-accent' : 'text-ui-muted',
                )}
                onClick={() => changeLanguage(loc)}
              >
                {loc === 'pt-BR' ? 'PT' : 'EN'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-xs font-medium text-ui-muted hover:text-ui-fg min-h-11 px-3"
            data-testid="onboarding-skip"
            onClick={skip}
          >
            {t('onboarding.skip')}
          </button>
        </div>

        <div
          className="flex gap-1.5 mb-5 shrink-0"
          role="tablist"
          aria-label={t('onboarding.stepProgress')}
        >
          {STEPS.map((_, i) => (
            <span
              key={STEPS[i]}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-holo-500' : 'bg-ui-hover-strong',
              )}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div
            key={current}
            data-testid={`onboarding-step-${current}`}
            className="flex-1 flex flex-col min-h-0 gap-4"
          >
            {current === 'welcome' ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 min-h-0 py-2">
                  <Logo className="h-11 w-11 opacity-90" />
                  <div className="flex items-end justify-center gap-1 px-2">
                    {heroDroids.map((d, i) => (
                      <DroidImage
                        key={d.id}
                        droid={d}
                        tier={ONBOARDING_HERO_TIERS[i] ?? 'default'}
                        size="lg"
                        priority
                        className={cn('rounded-2xl', fanStyles[i])}
                      />
                    ))}
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h1
                      data-testid="onboarding-heading"
                      className="font-display text-2xl sm:text-[1.75rem] font-bold leading-tight text-balance text-ui-fg"
                    >
                      {t('onboarding.welcomeHeadlineBefore')}
                      <span className="text-ui-accent">{t('onboarding.welcomeHeadlineAccent')}</span>
                    </h1>
                    <p className="text-sm text-ui-secondary text-pretty leading-relaxed">
                      {t('onboarding.welcomeSub')}
                    </p>
                  </div>
                </div>
              </>
            ) : null}

            {current === 'cycle' ? (
              <>
                <StepHeader title={t('onboarding.choosePath')} subtitle={t('onboarding.cycleHint')} />
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-3">
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
                          'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left min-h-[5rem] transition-all',
                          selected
                            ? 'border-holo-400 ring-2 ring-holo-500/50 bg-holo-600/15 shadow-lg shadow-holo-900/20'
                            : 'border-ui bg-ui-hover hover:bg-white/8',
                        )}
                      >
                        {hero ? (
                          <DroidImage
                            droid={hero}
                            tier={
                              (getRebirth(c.id, 1)?.requirements[0]?.rarity ?? 'default') as TierId
                            }
                            size="md"
                            className="shrink-0"
                          />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base">
                            {formatCycleDisplayName(c.name, i18n.language)}
                          </p>
                          <p className="text-xs text-ui-soft mt-0.5">
                            {t('onboarding.rebirthCount', { count: rebirthCount })}
                          </p>
                        </div>
                        {selected ? (
                          <CheckCircle {...uiIconProps} className="text-ui-accent shrink-0" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}

            {current === 'progress' ? (
              <>
                <StepHeader title={t('onboarding.progressTitle')} subtitle={t('onboarding.progressHint')} />
                <div className="flex flex-wrap gap-2 shrink-0">
                  {[
                    { label: t('onboarding.chipStart'), value: 0 },
                    { label: t('onboarding.chipMid'), value: 20 },
                  ].map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      className={cn(
                        'rounded-full px-4 py-2 text-sm min-h-11 border font-medium',
                        completed === chip.value
                          ? 'border-holo-400 bg-holo-600/25 text-holo-900'
                          : 'border-ui bg-ui-hover text-ui-secondary',
                      )}
                      onClick={() => setCompleted(chip.value)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-ui bg-ui-hover p-5 space-y-4 shrink-0">
                  <div className="flex items-center justify-center gap-5">
                    <Button
                      variant="secondary"
                      size="icon"
                      iconOnly
                      icon={<Minus {...uiIconProps} size={22} />}
                      aria-label={t('onboarding.decrease')}
                      className="min-h-12 min-w-12 [&_svg]:size-[22px]"
                      disabled={completed <= 0}
                      onClick={() => setCompleted((v) => Math.max(0, v - 1))}
                    />
                    <div className="text-center min-w-[5rem]">
                      <p className="text-[10px] uppercase tracking-widest text-ui-soft">
                        {t('onboarding.progressHintShort')}
                      </p>
                      <p className="font-sans text-[56px] font-bold tabular-nums text-ui-fg leading-none py-1">
                        {completed}
                      </p>
                      <p className="text-xs text-ui-muted">
                        {t('onboarding.progressNext', { n: nextRebirth })}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      iconOnly
                      icon={<Plus {...uiIconProps} size={22} />}
                      aria-label={t('onboarding.increase')}
                      className="min-h-12 min-w-12 [&_svg]:size-[22px]"
                      disabled={completed >= REBIRTHS_PER_PATH}
                      onClick={() => setCompleted((v) => Math.min(REBIRTHS_PER_PATH, v + 1))}
                    />
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
                  <div
                    className="rounded-xl border border-ui bg-ui-hover p-3 space-y-2 shrink-0"
                    data-testid="onboarding-rebirth-preview"
                  >
                    <p className="text-xs font-semibold text-ui-secondary">
                      {t('onboarding.nextReqPreview', { n: nextRebirth })}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {preview.requirements.map((req) => {
                        const d = droidById.get(req.droidId)
                        if (!d) return null
                        return (
                          <div
                            key={req.droidId}
                            className="flex items-center gap-2 text-xs bg-ui-sunken rounded-lg px-2 py-1.5"
                          >
                            <DroidImage droid={d} tier={req.rarity} size="sm" />
                            <span className="font-medium text-ui-fg">{d.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {current === 'features' ? (
              <div className="flex-1 flex flex-col justify-center gap-5 min-h-0 py-2">
                <StepHeader title={t('onboarding.featuresTitle')} subtitle={t('onboarding.featuresHint')} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                  {[
                    {
                      icon: TreeStructure,
                      label: t('nav.progress'),
                      desc: t('onboarding.featureProgressDesc'),
                    },
                    { icon: Storefront, label: t('nav.sell'), desc: t('onboarding.featureSellDesc') },
                    { icon: Export, label: t('onboarding.featureExport'), desc: t('onboarding.featureExportDesc') },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-ui bg-ui-hover p-3.5 flex flex-col items-center gap-2 text-center min-h-[7.5rem] justify-center"
                    >
                      <Icon {...uiIconProps} className="text-ui-accent" size={28} />
                      <span className="text-xs font-semibold leading-tight text-ui-fg">{label}</span>
                      <span className="text-[10px] leading-snug text-ui-soft text-pretty">{desc}</span>
                    </div>
                  ))}
                </div>
                <Switch
                  label={t('settings.trackInventory')}
                  checked={settings.trackInventory}
                  onChange={(v) => updateSettings({ trackInventory: v })}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 flex gap-2 pt-4 mt-auto shrink-0 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
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
            <Button
              className="flex-1 min-h-11"
              data-testid="onboarding-start"
              icon={<ArrowRight {...uiIconProps} />}
              onClick={goNext}
            >
              {t('onboarding.start')}
            </Button>
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
    </div>
  )
}
