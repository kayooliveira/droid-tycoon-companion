import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOverlayStackRegister } from '../OverlayStackProvider'
import { OverlayPortal } from '../ui/OverlayPortal'
import { readTierCelebrationColors } from './superRebirthTierSamples'

export type SuperRebirthCelebrationProps = {
  cycleNumber: number
  cycleName: string
  reducedMotion: boolean
  onComplete: () => void
}

const PARTICLE_COUNT = 36

export function SuperRebirthCelebration({
  cycleNumber,
  cycleName,
  reducedMotion,
  onComplete,
}: SuperRebirthCelebrationProps) {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)
  const finishedRef = useRef(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const [live, setLive] = useState(true)

  useOverlayStackRegister(true)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setLive(false)
    timelineRef.current?.kill()
    onComplete()
  }, [onComplete])

  const handleSkip = useCallback(() => {
    const root = rootRef.current
    if (!root || finishedRef.current) return
    if (reducedMotion) {
      finish()
      return
    }
    gsap.to(root, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.out',
      onComplete: finish,
    })
  }, [finish, reducedMotion])

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const scrim = root.querySelector('[data-sr-scrim]')
      const burst = root.querySelector('[data-sr-burst]')
      const shock = root.querySelector('[data-sr-shock]')
      const title = root.querySelector('[data-sr-title]')
      const cycleEl = root.querySelector('[data-sr-cycle]')
      const nameEl = root.querySelector('[data-sr-name]')
      const particles = root.querySelectorAll('[data-sr-particle]')

      if (reducedMotion) {
        const tl = gsap.timeline({ onComplete: finish })
        timelineRef.current = tl
        tl.fromTo(scrim, { opacity: 0 }, { opacity: 0.72, duration: 0.18 })
        tl.fromTo(
          [title, cycleEl, nameEl],
          { opacity: 0 },
          { opacity: 1, duration: 0.28, stagger: 0.06 },
          0.05,
        )
        tl.to(root, { opacity: 0, duration: 0.32, delay: 0.35 })
        return () => {
          tl.kill()
        }
      }

      const colors = readTierCelebrationColors(root)
      particles.forEach((node, i) => {
        if (!(node instanceof HTMLElement)) return
        node.style.setProperty('--sr-p-color', colors[i % colors.length] ?? colors[0]!)
      })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: finish,
      })
      timelineRef.current = tl

      gsap.set(root, { opacity: 1 })
      gsap.set([burst, shock, title, cycleEl, nameEl], { opacity: 0 })
      gsap.set(burst, { scale: 0.2, transformOrigin: '50% 50%' })
      gsap.set(shock, { scale: 0.35, transformOrigin: '50% 50%' })
      gsap.set(title, { y: 28, scale: 1.35 })
      gsap.set(cycleEl, { y: 48, scale: 1.55 })
      gsap.set(nameEl, { y: 20, opacity: 0 })
      gsap.set(particles, { opacity: 0, scale: 0 })

      tl.to(scrim, { opacity: 0.88, duration: 0.35 }, 0)
      tl.to(
        burst,
        { opacity: 0.95, scale: 1.2, duration: 0.55, ease: 'power2.out' },
        0.12,
      )
      tl.to(burst, { opacity: 0, scale: 1.65, duration: 0.45, ease: 'power2.in' }, 0.45)
      tl.to(
        shock,
        { opacity: 0.7, scale: 2.8, duration: 0.85, ease: 'expo.out' },
        0.18,
      )
      tl.to(shock, { opacity: 0, duration: 0.5 }, 0.75)
      tl.to(
        title,
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.4)' },
        0.52,
      )
      tl.to(
        cycleEl,
        { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: 'back.out(1.7)' },
        0.62,
      )
      tl.to(nameEl, { opacity: 1, y: 0, duration: 0.35 }, 0.78)

      particles.forEach((node, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2
        const radius = 90 + (i % 5) * 18
        const dx = Math.cos(angle) * radius
        const dy = Math.sin(angle) * radius
        tl.to(
          node,
          {
            opacity: 1,
            scale: 1,
            x: dx,
            y: dy,
            duration: 0.65,
            ease: 'power2.out',
          },
          0.45 + (i % 8) * 0.02,
        )
        tl.to(
          node,
          {
            opacity: 0,
            y: `+=${24 + (i % 6) * 6}`,
            duration: 0.9,
            ease: 'power1.in',
          },
          1.55 + (i % 6) * 0.03,
        )
      })

      tl.to([title, cycleEl, nameEl], { opacity: 0, y: -12, duration: 0.38, stagger: 0.04 }, 2.65)
      tl.to(scrim, { opacity: 0, duration: 0.42 }, 2.75)
      tl.to(root, { opacity: 0, duration: 0.2 }, 3.05)

      return () => {
        tl.kill()
      }
    },
    { scope: rootRef, dependencies: [cycleName, cycleNumber, finish, reducedMotion] },
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSkip])

  if (!live) return null

  return (
    <OverlayPortal>
      <div
        ref={rootRef}
        className="sr-celebration"
        data-testid="super-rebirth-celebration"
        role="presentation"
        aria-hidden={false}
      >
        <button
          type="button"
          className="sr-celebration__skip"
          aria-label={t('progress.superCelebrationSkip')}
          onClick={handleSkip}
        />
        <div className="sr-tier-samples" data-sr-tier-samples aria-hidden>
          <i className="tier-chip" data-tier="default" />
          <i className="tier-chip" data-tier="diamond" />
          <i className="tier-chip" data-tier="gold" />
          <i className="tier-chip" data-tier="beskar" />
          <i className="tier-chip" data-tier="galactic" />
          <i className="tier-chip" data-tier="stellar" />
          <i className="tier-chip" data-tier="kyber" />
        </div>
        <div data-sr-scrim className="sr-celebration__scrim" />
        <div className="sr-celebration__stage">
          <div data-sr-burst className="sr-celebration__burst" />
          <div data-sr-shock className="sr-celebration__shock" />
          <div className="sr-celebration__particles" aria-hidden>
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
              <i key={i} data-sr-particle className="sr-celebration__particle" />
            ))}
          </div>
          <p data-sr-title className="sr-celebration__title">
            {t('progress.superCelebrationTitle')}
          </p>
          <p data-sr-cycle className="sr-celebration__cycle" aria-live="polite">
            {t('progress.superCelebrationCycle', { n: cycleNumber })}
          </p>
          <p data-sr-name className="sr-celebration__name">
            {cycleName}
          </p>
        </div>
      </div>
    </OverlayPortal>
  )
}
