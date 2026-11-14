import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOverlayStackRegister } from '../OverlayStackProvider'
import { OverlayPortal } from '../ui/OverlayPortal'
import { createSuperRebirthParticleFx } from './superRebirthParticleCanvas'
import { readTierCelebrationPalette } from './superRebirthTierSamples'

export type SuperRebirthCelebrationProps = {
  cycleNumber: number
  cycleName: string
  reducedMotion: boolean
  onComplete: () => void
}

const RAY_COUNT = 16

export function SuperRebirthCelebration({
  cycleNumber,
  cycleName,
  reducedMotion,
  onComplete,
}: SuperRebirthCelebrationProps) {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<ReturnType<typeof createSuperRebirthParticleFx> | null>(null)
  const finishedRef = useRef(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const shellRef = useRef<HTMLElement | null>(null)
  const [live, setLive] = useState(true)

  const titleWords = useMemo(
    () => t('progress.superCelebrationTitle').split(/\s+/).filter(Boolean),
    [t],
  )

  useOverlayStackRegister(true)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setLive(false)
    timelineRef.current?.kill()
    fxRef.current?.dispose()
    document.documentElement.removeAttribute('data-sr-show')
    if (shellRef.current) {
      gsap.set(shellRef.current, { clearProps: 'transform,filter,opacity' })
    }
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
      duration: 0.28,
      ease: 'power2.inOut',
      onComplete: finish,
    })
  }, [finish, reducedMotion])

  useEffect(() => {
    document.documentElement.setAttribute('data-sr-show', '1')
    shellRef.current = document.querySelector('.app-shell')
    return () => {
      document.documentElement.removeAttribute('data-sr-show')
    }
  }, [])

  useEffect(() => {
    if (!live || reducedMotion) return
    let raf = 0
    const loop = (time: number) => {
      fxRef.current?.tick(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [live, reducedMotion])

  useEffect(() => {
    const onResize = () => fxRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useGSAP(
    () => {
      const root = rootRef.current
      const canvas = canvasRef.current
      if (!root || !canvas) return

      const backdrop = root.querySelector('[data-sr-backdrop]')
      const core = root.querySelector('[data-sr-core]')
      const flash = root.querySelector('[data-sr-flash]')
      const shock = root.querySelector('[data-sr-shock]')
      const shock2 = root.querySelector('[data-sr-shock-2]')
      const numGlow = root.querySelector('[data-sr-num-glow]')
      const shake = root.querySelector('[data-sr-shake]')
      const rays = root.querySelectorAll('[data-sr-ray]')
      const titleWords = root.querySelectorAll('[data-sr-title-word]')
      const num = root.querySelector('[data-sr-number]')
      const subtitle = root.querySelector('[data-sr-subtitle]')
      const shell = shellRef.current

      const palette = readTierCelebrationPalette(root)
      fxRef.current = createSuperRebirthParticleFx(canvas, palette)
      fxRef.current.resize()

      const centerBurst = () => {
        const c = canvas.getBoundingClientRect()
        const cx = c.width / 2
        const cy = c.height * 0.46
        fxRef.current?.ignite(cx, cy, 1.05)
      }

      if (reducedMotion) {
        const tl = gsap.timeline({ onComplete: finish })
        timelineRef.current = tl
        tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
        tl.fromTo(
          [titleWords, num, subtitle],
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.07 },
          0.08,
        )
        tl.to(root, { opacity: 0, duration: 0.35, ease: 'power2.inOut' }, 0.75)
        return () => tl.kill()
      }

      const tl = gsap.timeline({ onComplete: finish })
      timelineRef.current = tl

      gsap.set(root, { opacity: 1 })
      gsap.set(backdrop, { opacity: 0 })
      gsap.set(core, { scaleX: 0, opacity: 0 })
      gsap.set(flash, { opacity: 0 })
      gsap.set(shock, { scale: 0.12, opacity: 0, filter: 'blur(0px)' })
      gsap.set(shock2, { scale: 0.08, opacity: 0, filter: 'blur(0px)' })
      gsap.set(numGlow, { opacity: 0, scale: 0.6 })
      gsap.set(rays, { scale: 0.4, opacity: 0 })
      gsap.set(titleWords, { y: 22, opacity: 0 })
      gsap.set(num, {
        scale: 2.15,
        opacity: 0,
        letterSpacing: '0.35em',
      })
      gsap.set(subtitle, { y: 16, opacity: 0 })
      if (shell) {
        gsap.set(shell, { opacity: 0 })
      }

      tl.to(backdrop, { opacity: 1, duration: 0.38, ease: 'power2.in' }, 0)
      tl.to(core, { scaleX: 1, opacity: 1, duration: 0.28, ease: 'power2.out' }, 0.12)
      tl.to(core, { opacity: 0.25, duration: 0.35, ease: 'power1.out' }, 0.42)

      tl.to(flash, { opacity: 0.92, duration: 0.07, ease: 'power1.in' }, 0.3)
      tl.to(flash, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.37)

      tl.to(
        shock,
        { opacity: 0.88, scale: 4.8, filter: 'blur(6px)', duration: 0.78, ease: 'expo.out' },
        0.32,
      )
      tl.to(shock, { opacity: 0.35, duration: 0.45, ease: 'power1.out' }, 0.55)
      tl.to(
        shock2,
        { opacity: 0.55, scale: 5.6, filter: 'blur(14px)', duration: 1.0, ease: 'expo.out' },
        0.38,
      )
      tl.to(shock2, { opacity: 0, duration: 0.65, ease: 'power2.in' }, 0.78)
      tl.to(shock, { opacity: 0, scale: 5.4, filter: 'blur(20px)', duration: 0.5, ease: 'power2.in' }, 0.92)

      if (shake) {
        tl.to(shake, { x: 9, y: -7, duration: 0.045, repeat: 7, yoyo: true, ease: 'none' }, 0.34)
        tl.set(shake, { x: 0, y: 0 }, 0.72)
      }

      tl.to(
        rays,
        { opacity: 0.55, scale: 1.25, duration: 0.55, stagger: { each: 0.015, from: 'center' } },
        0.36,
      )
      tl.to(rays, { opacity: 0, duration: 0.55, stagger: { each: 0.01, from: 'random' } }, 1.05)

      tl.call(centerBurst, [], 0.38)

      tl.to(
        titleWords,
        { y: 0, opacity: 1, duration: 0.38, stagger: 0.05, ease: 'back.out(1.5)' },
        0.82,
      )
      tl.to(
        num,
        {
          scale: 1,
          opacity: 1,
          letterSpacing: '0.02em',
          duration: 0.36,
          ease: 'power4.out',
        },
        0.78,
      )
      tl.to(numGlow, { opacity: 0.72, scale: 1, duration: 0.38, ease: 'power2.out' }, 0.78)
      tl.to(numGlow, { opacity: 0.3, scale: 1.06, duration: 0.9, ease: 'power1.out' }, 1.2)
      tl.to(subtitle, { y: 0, opacity: 1, duration: 0.42, ease: 'power2.out' }, 1.05)

      tl.to(
        [titleWords, num, numGlow, subtitle, core, shock, shock2, flash],
        { opacity: 0, y: -14, duration: 0.42, stagger: 0.03, ease: 'power2.in' },
        2.85,
      )
      tl.to(backdrop, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 2.95)
      tl.to(root, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 3.25)

      return () => {
        tl.kill()
        fxRef.current?.dispose()
      }
    },
    { scope: rootRef, dependencies: [cycleName, cycleNumber, finish, reducedMotion, titleWords] },
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="sr-celebration-title"
        aria-describedby="sr-celebration-desc"
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
        <div data-sr-backdrop className="sr-celebration__backdrop" />
        <canvas ref={canvasRef} className="sr-celebration__canvas" aria-hidden />
        <div className="sr-celebration__viewport-fx" aria-hidden>
          <div data-sr-flash className="sr-celebration__flash" />
          <div data-sr-shock className="sr-celebration__shock" />
          <div data-sr-shock-2 className="sr-celebration__shock sr-celebration__shock--outer" />
          <div className="sr-celebration__rays">
            {Array.from({ length: RAY_COUNT }, (_, i) => (
              <i
                key={i}
                data-sr-ray
                className="sr-celebration__ray"
                style={{ ['--sr-ray-i' as string]: String(i) }}
              />
            ))}
          </div>
          <div data-sr-core className="sr-celebration__core" />
        </div>
        <div data-sr-shake className="sr-celebration__shake">
          <div data-sr-stage className="sr-celebration__stage">
            <div className="sr-celebration__copy">
              <p id="sr-celebration-title" className="sr-celebration__title">
                {titleWords.map((word) => (
                  <span key={word} data-sr-title-word className="sr-celebration__title-word">
                    {word}
                  </span>
                ))}
              </p>
              <div className="sr-celebration__num-wrap">
                <span data-sr-num-glow className="sr-celebration__num-glow" aria-hidden />
                <p data-sr-number className="sr-celebration__number" aria-live="polite">
                  {cycleNumber}
                </p>
              </div>
              <p id="sr-celebration-desc" data-sr-subtitle className="sr-celebration__subtitle">
                {cycleName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </OverlayPortal>
  )
}
