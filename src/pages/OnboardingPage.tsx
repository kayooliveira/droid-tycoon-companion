import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameData } from '../domain/gameData'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore } from '../store/useAppStore'

const steps = ['welcome', 'path', 'progress', 'prefs', 'done'] as const

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const setPath = useAppStore((s) => s.setPath)
  const setProgress = useAppStore((s) => s.setProgress)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const settings = useAppStore((s) => s.settings)

  const [pathId, setPathIdLocal] = useState('path-1')
  const [completed, setCompleted] = useState(0)

  const current = steps[step]!

  const finish = () => {
    setPath(pathId)
    setProgress(completed + 1, completed)
    setOnboardingComplete(true)
    navigate('/')
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
                    Droid Tycoon Companion
                  </h1>
                  <p className="text-sm text-zinc-400 max-w-md">
                    Track rebirths, inventory, and sell decisions for Star Wars Droid Tycoon
                    (UEFN island 7865-8305-9184). Fan-made — not official.
                  </p>
                </div>
                <Button className="w-full" data-testid="onboarding-start" onClick={() => setStep(1)}>
                  Start
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  data-testid="onboarding-skip"
                  onClick={() => finish()}
                >
                  Skip for now
                </Button>
              </>
            ) : null}

            {current === 'path' ? (
              <>
                <h2 className="font-display text-lg">Choose your Path</h2>
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
                      <p className="text-xs text-zinc-500">{c.id}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </>
            ) : null}

            {current === 'progress' ? (
              <>
                <h2 className="font-display text-lg">Current progress</h2>
                <p className="text-sm text-zinc-400">
                  How many rebirths have you already completed on this path?
                </p>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={completed}
                  onChange={(e) => setCompleted(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center font-display text-xl">{completed} / 40 completed</p>
                <p className="text-xs text-zinc-500 text-center">
                  Next rebirth to work on: #{completed + 1}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </>
            ) : null}

            {current === 'prefs' ? (
              <>
                <h2 className="font-display text-lg">Preferences</h2>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Theme
                  <select
                    className="rounded-lg bg-surface-800 border border-white/10 px-2 py-1"
                    value={settings.theme}
                    onChange={(e) =>
                      updateSettings({ theme: e.target.value as 'dark' | 'light' | 'system' })
                    }
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Track inventory
                  <input
                    type="checkbox"
                    checked={settings.trackInventory}
                    onChange={(e) => updateSettings({ trackInventory: e.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Animations
                  <input
                    type="checkbox"
                    checked={settings.animationsEnabled}
                    onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
                  />
                </label>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(4)}>
                    Finish
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
                  <h2 className="font-display text-xl text-gradient-holo">You&apos;re set</h2>
                  <p className="text-sm text-zinc-400">Your companion dashboard is ready.</p>
                </motion.div>
                <Button className="w-full" onClick={finish}>
                  Open Dashboard
                </Button>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}
