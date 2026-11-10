import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Desktop,
  Export,
  Minus,
  Moon,
  Plus,
  Storefront,
  Sun,
  TreeStructure,
} from '@phosphor-icons/react'
import type { AppLocale } from '../i18n/detectLocale'
import { setDocumentLanguage, initI18n } from '../i18n/index'
import { cycleById, droidById, gameData, getRebirth } from '../domain/gameData'
import { formatCycleDisplayName } from '../lib/cycleLabel'
import { DroidImage } from '../components/DroidImage'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'
import { ThemeCardGroup } from '../components/appearance/ThemeCard'
import { useAppearance, type AppearanceModePref } from '../hooks/useAppearance'
import { uiIconProps } from '../components/ui/iconStyle'
import { cn } from '../lib/utils'
import { isDesignGateCapture, isOnboardingGateCapture } from '../e2e/designGate'
import { OnboardingGateView } from '../components/onboarding/OnboardingGateView'
const STEPS = ['welcome', 'cycle', 'progress', 'theme', 'features'] as const
const REBIRTHS_PER_PATH = 40
const CONTENT_STEP_COUNT = 4

const WELCOME_TRIO = [
  { id: 'r7', tier: 'galactic' as const },
  { id: 'lep', tier: 'kyber' as const },
  { id: 'bb-8', tier: 'rainbow' as const },
] as const

const MODE_OPTS: { value: AppearanceModePref; icon: typeof Moon; labelKey: string }[] = [
  { value: 'system', icon: Desktop, labelKey: 'settings.themeSystemShort' },
  { value: 'light', icon: Sun, labelKey: 'settings.themeLight' },
  { value: 'dark', icon: Moon, labelKey: 'settings.themeDark' },
]

function contentStepBarIndex(step: number): number | null {
  if (step <= 0) return null
  return Math.min(step - 1, CONTENT_STEP_COUNT - 1)
}

function OnboardingStepsBar({
  active,
  ariaLabel,
}: {
  active: number
  ariaLabel: string
}) {
  return (
    <div className="steps" role="img" aria-label={ariaLabel}>
      {Array.from({ length: CONTENT_STEP_COUNT }, (_, i) => (
        <i key={i} className={i <= active ? 'on' : undefined} />
      ))}
    </div>
  )
}

export function OnboardingCycleMeter({
  completed,
  cycleName,
  previewLabel,
}: {
  completed: number
  cycleName: string
  previewLabel: string
}) {
  const { t } = useTranslation()
  const cells = useMemo(
    () =>
      Array.from({ length: REBIRTHS_PER_PATH }, (_, i) => {
        const n = i + 1
        const classes = [n % 5 === 0 ? 'm5' : '', i < completed ? 'done' : '', i === completed ? 'cur' : '']
          .filter(Boolean)
          .join(' ')
        return <i key={n} className={classes || undefined} />
      }),
    [completed],
  )

  return (
    <div className="cm cm--compact">
      <div className="cm-top">
        <span className="cm-num">{completed}</span>
        <span className="cm-of">{t('home.cycleProgressOf', { total: REBIRTHS_PER_PATH })}</span>
        <span className="cm-label t-label">{cycleName}</span>
      </div>
      <div className="cm-cells" aria-hidden>
        {cells}
      </div>
      <div className="cm-marks" aria-hidden>
        <span style={{ left: '23.75%' }}>10</span>
        <span style={{ left: '48.75%' }}>20</span>
        <span style={{ left: '73.75%' }}>30</span>
        <span style={{ left: '98.75%' }}>40</span>
      </div>
      <div className="cm-foot">
        <span className="t-meta">{previewLabel}</span>
      </div>
    </div>
  )
}

export function OnboardingPage() {
  if (isOnboardingGateCapture()) {
    return <OnboardingGateView />
  }
  return <OnboardingFlow />
}

function OnboardingFlow() {
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
  const { theme: appearanceTheme, modePref, setTheme: setAppearanceTheme, setModePref } =
    useAppearance()

  const [step, setStep] = useState(0)
  const onbStep = params.get('e2e_onb_step')
  useEffect(() => {
    if (!onbStep) return
    const n = Number(onbStep)
    if (Number.isFinite(n) && n >= 0 && n < STEPS.length) setStep(n)
  }, [onbStep])

  useEffect(() => {
    if (!isDesignGateCapture() || onbStep == null) return
    const n = Number(onbStep)
    if (!Number.isFinite(n)) return
    if (n >= 1) setPathId('path-5')
    if (n === 2) setCompleted(29)
    if (n === 3) setAppearanceTheme('oficina')
  }, [onbStep, setAppearanceTheme])
  const [pathId, setPathId] = useState(progressStore.pathId)
  const [completed, setCompleted] = useState(isRerun ? progressStore.completedOnPath : 0)
  const touchStartX = useRef<number | null>(null)

  const current = STEPS[step]!
  const barIndex = contentStepBarIndex(step)
  const nextRebirth = Math.min(completed + 1, REBIRTHS_PER_PATH)
  const preview = getRebirth(pathId, nextRebirth)
  const cycle = cycleById.get(pathId)
  const cycleDisplayName = cycle ? formatCycleDisplayName(cycle.name, i18n.language) : pathId

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

  const stepBarAria =
    barIndex != null
      ? t('onboarding.themeStepProgress', { defaultValue: `Passo ${barIndex + 1} de ${CONTENT_STEP_COUNT}` })
      : t('onboarding.stepProgress')

  return (
    <div
      data-testid="onboarding-shell"
      className={cn(
        'app min-h-dvh flex flex-col pb-[env(safe-area-inset-bottom)]',
        current !== 'welcome' && 'pt-[env(safe-area-inset-top)]',
        current === 'welcome' && 'onboarding-welcome-shell',
      )}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <main
        className={cn(
          'scroll mx-auto w-full max-w-lg',
          current === 'welcome'
            ? 'onboarding-welcome-scroll'
            : 'flex-1 flex flex-col min-h-0 px-4 sm:px-6 py-4',
        )}
      >
        {step > 0 ? (
          <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
            <div
              className="seg onboarding-lang-pill"
              data-testid="onboarding-lang-pill"
              role="group"
              aria-label={t('onboarding.language')}
            >
              {(['pt-BR', 'en'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={settings.locale === loc}
                  onClick={() => changeLanguage(loc)}
                >
                  {loc === 'pt-BR' ? 'PT' : 'EN'}
                </button>
              ))}
            </div>
            <span className="w-11" aria-hidden />
          </div>
        ) : null}

        <div
          key={current}
          data-testid={`onboarding-step-${current}`}
          className={cn(
            current === 'welcome'
              ? 'onboarding-welcome-compact'
              : 'flex-1 flex flex-col min-h-0 gap-3',
          )}
        >
          {current === 'welcome' ? (
            <>
              <header className="top">
                <span className="top-brand">{t('app.name')}</span>
                <div className="top-aside" />
                <h1 className="t-display" style={{ fontSize: 'min(var(--title-size), 11vw)' }}>
                  {t('onboarding.welcomeTitle')}
                </h1>
              </header>
              <h2
                data-testid="onboarding-heading"
                className="t-h2"
                style={{ marginTop: 20, fontSize: 'calc(var(--h2-size) + 8px)' }}
              >
                {t('onboarding.welcomeHeadlineBefore')}
                {t('onboarding.welcomeHeadlineAccent')}
              </h2>
              <p className="hint" style={{ marginTop: 8 }}>
                {t('onboarding.welcomeSub')}
              </p>
              <div className="trio onboarding-welcome-tiles" style={{ margin: '28px 0 24px' }}>
                {WELCOME_TRIO.map(({ id, tier }) => {
                  const droid = droidById.get(id)
                  if (!droid) return null
                  return <DroidImage key={id} droid={droid} tier={tier} priority />
                })}
              </div>
              <div className="stack">
                <button
                  type="button"
                  className="btn btn--primary"
                  data-testid="onboarding-start"
                  onClick={goNext}
                >
                  {t('onboarding.start')}
                </button>
                <button type="button" className="btn btn--ghost" onClick={skip}>
                  {t('onboarding.skip')}
                </button>
              </div>
              <p className="hint" style={{ marginTop: 20 }}>
                {t('onboarding.welcomeFootnote')}
              </p>
            </>
          ) : null}

          {barIndex != null ? <OnboardingStepsBar active={barIndex} ariaLabel={stepBarAria} /> : null}

          {current === 'cycle' ? (
            <>
              <h1
                data-testid="onboarding-heading"
                className="t-display"
                style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}
              >
                {t('onboarding.choosePath')}
              </h1>
              <p className="hint" style={{ marginBottom: 18 }}>
                {t('onboarding.cycleHint')}
              </p>
              <div className="opts flex-1 min-h-0 overflow-y-auto" role="radiogroup" aria-label={t('onboarding.choosePath')}>
                {gameData.cycles.map((c) => {
                  const rebirthCount = c.rebirths.length
                  const id = `onb-cycle-${c.id}`
                  return (
                    <label key={c.id} className="opt" data-testid={`onboarding-cycle-${c.id}`} htmlFor={id}>
                      <input
                        id={id}
                        type="radio"
                        name="onb-path"
                        checked={pathId === c.id}
                        onChange={() => setPathId(c.id)}
                      />
                      <span className="mark" aria-hidden />
                      <span className="opt-t">
                        {formatCycleDisplayName(c.name, i18n.language)}
                        <small>{t('onboarding.rebirthCount', { count: rebirthCount })}</small>
                      </span>
                    </label>
                  )
                })}
              </div>
            </>
          ) : null}

          {current === 'progress' ? (
            <>
              <h1
                data-testid="onboarding-heading"
                className="t-display"
                style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}
              >
                {t('onboarding.progressTitle')}
              </h1>
              <p className="hint" style={{ marginBottom: 18 }}>
                {t('onboarding.progressHint')}
              </p>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="row-main">
                  <span className="dname" style={{ display: 'block' }}>
                    {t('onboarding.progressHintShort')}
                  </span>
                  <span className="hint">{t('onboarding.progressNext', { n: nextRebirth })}</span>
                </span>
                <div className="stepper">
                  <Button
                    variant="secondary"
                    size="icon"
                    iconOnly
                    icon={<Minus {...uiIconProps} />}
                    aria-label={t('onboarding.decrease')}
                    disabled={completed <= 0}
                    onClick={() => setCompleted((v) => Math.max(0, v - 1))}
                  />
                  <span className="stepper-val">{completed}</span>
                  <Button
                    variant="primary"
                    size="icon"
                    iconOnly
                    icon={<Plus {...uiIconProps} />}
                    aria-label={t('onboarding.increase')}
                    disabled={completed >= REBIRTHS_PER_PATH}
                    onClick={() => setCompleted((v) => Math.min(REBIRTHS_PER_PATH, v + 1))}
                  />
                </div>
              </div>
              <div className="chips" style={{ marginTop: 14 }}>
                {[
                  { label: t('onboarding.chipStart'), value: 0 },
                  { label: t('onboarding.chipMid'), value: 20 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    className="chip"
                    aria-pressed={
                      isDesignGateCapture() && onbStep === '2'
                        ? chip.value === 20
                        : completed === chip.value
                    }
                    onClick={() => setCompleted(chip.value)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                className="sr-only"
                min={0}
                max={REBIRTHS_PER_PATH}
                value={completed}
                onChange={(e) => setCompleted(Number(e.target.value))}
                data-testid="onboarding-rebirth-input"
                aria-label={t('onboarding.progressHintShort')}
              />
              <div style={{ marginTop: 18 }}>
                <OnboardingCycleMeter
                  completed={completed}
                  cycleName={cycleDisplayName}
                  previewLabel={t('onboarding.nextReqPreview', { n: nextRebirth })}
                />
              </div>
              {preview && !(isDesignGateCapture() && onbStep === '2') ? (
                <div data-testid="onboarding-rebirth-preview" className="mini-tiles" style={{ marginTop: 12 }}>
                  {preview.requirements.map((req) => {
                    const d = droidById.get(req.droidId)
                    if (!d) return null
                    return <DroidImage key={req.droidId} droid={d} tier={req.rarity} size="xs" />
                  })}
                </div>
              ) : null}
            </>
          ) : null}

          {current === 'theme' ? (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <h1
                data-testid="onboarding-heading"
                className="t-display"
                style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}
              >
                {t('onboarding.themeTitle')}
              </h1>
              <p className="hint" style={{ marginBottom: 18 }}>
                {t('onboarding.themeHint')}
              </p>
              <ThemeCardGroup value={appearanceTheme} onChange={setAppearanceTheme} />
              <div className="seg" role="group" aria-label={t('settings.theme')} style={{ marginTop: 16 }}>
                {MODE_OPTS.map(({ value, icon: Icon, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={modePref === value}
                    onClick={() => setModePref(value)}
                  >
                    <Icon {...uiIconProps} size={18} className="inline-block align-middle mr-1" />
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {current === 'features' ? (
            <>
              <h1
                data-testid="onboarding-heading"
                className="t-display"
                style={{ marginTop: 22, marginBottom: 8, fontSize: 'min(var(--title-size), 9vw)' }}
              >
                {t('onboarding.featuresTitle')}
              </h1>
              <p className="hint" style={{ marginBottom: 18 }}>
                {t('onboarding.featuresHint')}
              </p>
              {[
                {
                  icon: TreeStructure,
                  label: t('nav.progress'),
                  desc: t('onboarding.featureProgressDesc'),
                },
                { icon: Storefront, label: t('nav.sell'), desc: t('onboarding.featureSellDesc') },
                {
                  icon: Export,
                  label: t('onboarding.featureExport'),
                  desc: t('onboarding.featureExportDesc'),
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="row">
                  <span className="row-ic">
                    <Icon {...uiIconProps} className="ic" />
                  </span>
                  <span className="row-main">
                    <span className="dname" style={{ display: 'block' }}>
                      {label}
                    </span>
                    <span className="hint">{desc}</span>
                  </span>
                </div>
              ))}
              <label className="switch-row" style={{ marginTop: 8 }}>
                <span>
                  <span style={{ display: 'block' }}>{t('settings.trackInventory')}</span>
                </span>
                <span className="switch">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={settings.trackInventory}
                    onChange={(e) => updateSettings({ trackInventory: e.target.checked })}
                    aria-label={t('settings.trackInventory')}
                  />
                  <i />
                </span>
              </label>
            </>
          ) : null}
        </div>

        {current === 'welcome' ? null : (
        <div className="stack shrink-0 pt-4" style={{ marginTop: 'auto' }}>
          {step < STEPS.length - 1 ? (
            <Button className="w-full btn btn--primary" data-testid="onboarding-next" onClick={goNext}>
              {t('onboarding.continue')}
            </Button>
          ) : (
            <Button className="w-full btn btn--primary" data-testid="onboarding-finish" onClick={finish}>
              {t('onboarding.ctaStart')}
            </Button>
          )}
          {step > 0 ? (
            <div className="grid2">
              <Button variant="secondary" data-testid="onboarding-back" onClick={goBack}>
                {t('onboarding.back')}
              </Button>
              <Button variant="ghost" onClick={skip}>
                {t('onboarding.skip')}
              </Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={skip}>
              {t('onboarding.skip')}
            </Button>
          )}
        </div>
        )}
      </main>
      {current === 'welcome' ? <div className="toast-slot" hidden /> : null}
    </div>
  )
}
