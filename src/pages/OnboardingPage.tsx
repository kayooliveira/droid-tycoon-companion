import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DeviceFrame } from '../components/onboarding/DeviceFrame'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'

const STEPS = [
  {
    id: 'welcome',
    titleKey: 'onboarding.feature1Title',
    copyKey: 'onboarding.feature1Copy',
    dark: '/onboarding/inicio-dark.png',
    light: '/onboarding/inicio-light.png',
    tilt: true,
  },
  {
    id: 'cycles',
    titleKey: 'onboarding.feature2Title',
    copyKey: 'onboarding.feature2Copy',
    dark: '/onboarding/ciclos-dark.png',
    light: '/onboarding/ciclos-light.png',
  },
  {
    id: 'inventory',
    titleKey: 'onboarding.feature3Title',
    copyKey: 'onboarding.feature3Copy',
    dark: '/onboarding/inventario-dark.png',
    light: '/onboarding/inventario-light.png',
  },
  {
    id: 'progress',
    titleKey: 'onboarding.feature4Title',
    copyKey: 'onboarding.feature4Copy',
    dark: '/onboarding/progresso-dark.png',
    light: '/onboarding/progresso-light.png',
  },
] as const

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isRerun = params.get('rerun') === '1'
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const [step, setStep] = useState(0)
  const current = STEPS[step]!

  const finish = useCallback(() => {
    setOnboardingComplete(true)
    try {
      localStorage.setItem('droiddeck:onboardingDone', '1')
    } catch {}
    navigate('/')
  }, [navigate, setOnboardingComplete])

  const skip = finish

  return (
    <div className="ob-page" data-testid={`onboarding-step-${current.id}`}>
      <button type="button" className="ob-skip" data-testid="onboarding-skip" onClick={skip}>
        {t('onboarding.skip')}
      </button>
      <div className="ob-stage">
        <DeviceFrame
          srcDark={current.dark}
          srcLight={current.light}
          tilt={'tilt' in current ? current.tilt : false}
        />
      </div>
      <h1 className="ob-title" data-testid="onboarding-heading">
        {t(current.titleKey)}
      </h1>
      <p className="ob-copy">{t(current.copyKey)}</p>
      <div className="ob-dots" aria-hidden>
        {STEPS.map((s, i) => (
          <i key={s.id} className={i === step ? 'on' : ''} />
        ))}
      </div>
      {step < STEPS.length - 1 ? (
        <Button
          className="ob-cta btn-wide"
          data-testid="onboarding-next"
          onClick={() => setStep((s) => s + 1)}
        >
          {t('onboarding.continue')}
        </Button>
      ) : (
        <Button className="ob-cta btn-wide" data-testid="onboarding-start" onClick={finish}>
          {isRerun ? t('onboarding.doneRerun') : t('onboarding.enter')}
        </Button>
      )}
    </div>
  )
}
