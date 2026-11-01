import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameDataSource } from '../data/dataSource'
import { gameData } from '../domain/gameData'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'
import { useAppStore, applyTheme } from '../store/useAppStore'
import { downloadJson, exportProgress, parseImportJson } from '../storage/exportImport'
import { useToast } from '../components/ToastProvider'

export function SettingsPage() {
  const navigate = useNavigate()
  const { push } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const settings = useAppStore((s) => s.settings)
  const progress = useAppStore((s) => s.progress)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setPath = useAppStore((s) => s.setPath)
  const setProgress = useAppStore((s) => s.setProgress)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const resetAll = useAppStore((s) => s.resetAll)
  const importState = useAppStore((s) => s.importState)
  const toPersisted = useAppStore((s) => s.toPersisted)

  const meta = gameDataSource.getMeta()
  const stale = gameDataSource.isStale()

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-2xl tracking-wide">Settings</h1>

      <GlassCard className="space-y-4">
        <h2 className="font-medium">Appearance & behavior</h2>
        <label className="flex justify-between text-sm items-center">
          Theme
          <select
            className="rounded-lg bg-surface-800 border border-white/10 px-2 py-1"
            value={settings.theme}
            onChange={(e) => {
              const theme = e.target.value as typeof settings.theme
              updateSettings({ theme })
              applyTheme(theme)
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className="flex justify-between text-sm items-center">
          Animations
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
          />
        </label>
        <label className="flex justify-between text-sm items-center">
          Track inventory
          <input
            type="checkbox"
            checked={settings.trackInventory}
            onChange={(e) => updateSettings({ trackInventory: e.target.checked })}
          />
        </label>
        <Button variant="secondary" onClick={() => navigate('/onboarding')}>
          Re-run onboarding
        </Button>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-medium">Progress</h2>
        <label className="block text-sm">
          Path
          <select
            className="mt-1 w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2"
            value={progress.pathId}
            onChange={(e) => setPath(e.target.value)}
          >
            {gameData.cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Completed rebirths on path ({progress.completedOnPath})
          <input
            type="range"
            min={0}
            max={40}
            value={progress.completedOnPath}
            className="w-full mt-2"
            onChange={(e) => {
              const completed = Number(e.target.value)
              setProgress(completed + 1, completed)
            }}
          />
        </label>
      </GlassCard>

      <GlassCard className="space-y-2 text-sm">
        <h2 className="font-medium">Game data</h2>
        <p>
          Version <span className="text-zinc-200">{meta.dataVersion}</span> · Game{' '}
          {meta.gameVersion} · Updated {meta.lastUpdated}
        </p>
        {stale ? (
          <Badge tone="warn">Data older than {gameData.staleAfterDays} days — consider refreshing</Badge>
        ) : (
          <Badge tone="success">Data fresh</Badge>
        )}
        <p className="text-xs text-zinc-500">
          Update with <code className="text-zinc-300">scripts/parse.py</code> and replace{' '}
          <code className="text-zinc-300">src/data/gameData.json</code>.
        </p>
        <ul className="text-xs text-zinc-500 list-disc pl-4">
          {(gameData.sources as Array<{ url?: string; name?: string }>).slice(0, 4).map((s, i) => (
            <li key={i}>
              <a className="text-holo-300 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                {s.name ?? s.url}
              </a>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-medium">Backup</h2>
        <Button
          variant="secondary"
          onClick={() => downloadJson('droid-tycoon-progress.json', exportProgress(toPersisted()))}
        >
          Export progress (JSON)
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          Import progress
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
              push(result.error)
              return
            }
            importState(result.state)
            push('Progress imported')
          }}
        />
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-medium text-red-300">Danger zone</h2>
        {!confirmReset ? (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Reset all data
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                resetAll()
                setOnboardingComplete(false)
                push('All data reset')
                navigate('/onboarding')
              }}
            >
              Confirm reset
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          </div>
        )}
      </GlassCard>

      <GlassCard className="text-xs text-zinc-500 space-y-2">
        <h2 className="font-medium text-zinc-300">Credits & attribution</h2>
        <p>
          Droid images from Droid Tycoon Helper / Star Wars Droid Tycoon Wiki (CC BY-SA). See{' '}
          public/assets/droids/ATTRIBUTION.md.
        </p>
        <p>
          Fan-made companion tool. Not affiliated with Epic Games, Lucasfilm, Disney, or FOAD.
        </p>
      </GlassCard>
    </div>
  )
}
