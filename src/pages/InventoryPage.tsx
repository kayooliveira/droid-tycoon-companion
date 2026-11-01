import { useMemo, useState } from 'react'
import { Trash } from '@phosphor-icons/react'
import { uiIconProps } from '../components/ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { droidById, gameData } from '../domain/gameData'
import { droidHasFutureNeedOnPath } from '../domain/sellCenter'
import { formatTierName } from '../domain/tiers'
import { formatBaseRarity, rarityLabel } from '../i18n/tierLabels'
import { useTierLabels } from '../i18n/useTierLabels'
import type { TierId } from '../domain/types'
import { DroidImage } from '../components/DroidImage'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../components/ToastProvider'
import {
  usePersistedInventoryFilters,
  type InventoryFilters,
} from '../hooks/usePersistedInventoryFilters'
import { useAppStore } from '../store/useAppStore'

export function InventoryPage() {
  const { t } = useTranslation()
  const tierLabels = useTierLabels()
  const inventory = useAppStore((s) => s.inventory)
  const progress = useAppStore((s) => s.progress)
  const addInventoryUnit = useAppStore((s) => s.addInventoryUnit)
  const updateInventoryUnit = useAppStore((s) => s.updateInventoryUnit)
  const removeInventoryUnit = useAppStore((s) => s.removeInventoryUnit)
  const trackInventory = useAppStore((s) => s.settings.trackInventory)
  const { push } = useToast()

  const [filters, setFilters] = usePersistedInventoryFilters()
  const { search, rarityFilter, tierFilter, neededFilter } = filters
  const setSearch = (search: string) => setFilters((f) => ({ ...f, search }))
  const setRarityFilter = (rarityFilter: string) => setFilters((f) => ({ ...f, rarityFilter }))
  const setTierFilter = (tierFilter: string) => setFilters((f) => ({ ...f, tierFilter }))
  const setNeededFilter = (neededFilter: InventoryFilters['neededFilter']) =>
    setFilters((f) => ({ ...f, neededFilter }))
  const [addOpen, setAddOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [newDroidId, setNewDroidId] = useState(gameData.droids[0]?.id ?? '')
  const [newTier, setNewTier] = useState<TierId>('default')
  const [newQty, setNewQty] = useState(1)

  const filtered = useMemo(() => {
    return inventory
      .filter((u) => {
        const d = droidById.get(u.droidId)
        if (search && !d?.name.toLowerCase().includes(search.toLowerCase())) return false
        if (rarityFilter !== 'all' && d?.baseRarity.toLowerCase() !== rarityFilter) return false
        if (tierFilter !== 'all' && u.tier !== tierFilter) return false
        const needed = droidHasFutureNeedOnPath(progress.pathId, progress.nextRebirth, u.droidId)
        if (neededFilter === 'needed' && !needed) return false
        if (neededFilter === 'not-needed' && needed) return false
        return true
      })
      .sort((a, b) =>
        (droidById.get(a.droidId)?.name ?? '').localeCompare(droidById.get(b.droidId)?.name ?? ''),
      )
  }, [inventory, search, rarityFilter, tierFilter, neededFilter, progress.pathId, progress.nextRebirth])

  const pickerDroids = useMemo(() => {
    const q = pickerSearch.toLowerCase()
    return gameData.droids
      .filter((d) => !q || d.name.toLowerCase().includes(q))
      .slice(0, 40)
  }, [pickerSearch])

  if (!trackInventory) {
    return (
      <GlassCard>
        <h1 className="font-display text-xl mb-2">{t('inventory.trackingOff')}</h1>
        <p className="text-sm text-zinc-400">{t('inventory.trackingOffHint')}</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="hidden md:block font-display text-2xl tracking-wide">{t('inventory.title')}</h1>
        <Button onClick={() => setAddOpen(true)}>{t('inventory.addDroid')}</Button>
      </div>
      <input
        className="w-full rounded-xl bg-surface-800 border border-white/10 px-4 py-3 text-sm min-h-11"
        placeholder={t('inventory.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2.5 text-sm min-h-11"
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
        >
          <option value="all">{t('inventory.allRarities')}</option>
          {gameData.baseRarities.map((r) => (
            <option key={r.id} value={r.id}>
              {rarityLabel(t, r.id)}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2.5 text-sm min-h-11"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="all">{t('inventory.allTiers')}</option>
          {gameData.rarities.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {formatTierName(tier.id, tierLabels)}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2.5 text-sm min-h-11"
          value={neededFilter}
          onChange={(e) => setNeededFilter(e.target.value as InventoryFilters['neededFilter'])}
        >
          <option value="all">{t('inventory.allNeeds')}</option>
          <option value="needed">{t('inventory.neededFilter')}</option>
          <option value="not-needed">{t('inventory.notNeededFilter')}</option>
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map((unit) => {
          const droid = droidById.get(unit.droidId)
          if (!droid) return null
          const needed = droidHasFutureNeedOnPath(progress.pathId, progress.nextRebirth, unit.droidId)
          return (
            <GlassCard key={unit.id} className="flex gap-3 items-center">
              <DroidImage droid={droid} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{droid.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge>{formatBaseRarity(droid.baseRarity, t)}</Badge>
                  <Badge tone="info">{formatTierName(unit.tier, tierLabels)}</Badge>
                  <Badge tone={needed ? 'warn' : 'success'}>
                    {needed ? t('inventory.neededLater') : t('inventory.notNeeded')}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  className="w-16 rounded-lg bg-surface-800 border border-white/10 px-2 py-1 text-sm"
                  value={unit.quantity}
                  onChange={(e) =>
                    updateInventoryUnit(unit.id, { quantity: Math.max(1, Number(e.target.value)) })
                  }
                />
                <Button
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  aria-label={t('a11y.removeUnit')}
                  onClick={() => {
                    removeInventoryUnit(unit.id)
                    push(t('inventory.removed'))
                  }}
                >
                  <Trash {...uiIconProps} />
                </Button>
              </div>
            </GlassCard>
          )
        })}
        {filtered.length === 0 ? (
          <GlassCard className="text-center py-8 space-y-3">
            <p className="text-sm text-zinc-400">{t('inventory.emptyHint')}</p>
            <Button className="min-h-11" onClick={() => setAddOpen(true)}>
              {t('inventory.addDroid')}
            </Button>
          </GlassCard>
        ) : null}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('inventory.modalTitle')}>
        <div className="space-y-3">
          <input
            className="w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2 text-sm"
            placeholder={t('inventory.searchDroids')}
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-auto grid grid-cols-2 gap-2">
            {pickerDroids.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setNewDroidId(d.id)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs ${
                  newDroidId === d.id ? 'border-holo-400/50 bg-holo-600/10' : 'border-white/10'
                }`}
              >
                <DroidImage droid={d} size="sm" className="!h-8 !w-8" />
                <span className="truncate">{d.name}</span>
              </button>
            ))}
          </div>
          <label className="block text-sm">
            {t('inventory.allTiers')}
            <select
              className="mt-1 w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2"
              value={newTier}
              onChange={(e) => setNewTier(e.target.value as TierId)}
            >
              {gameData.rarities.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            {t('inventory.quantity')}
            <input
              type="number"
              min={1}
              max={999}
              className="mt-1 w-full rounded-lg bg-surface-800 border border-white/10 px-3 py-2"
              value={newQty}
              onChange={(e) => setNewQty(Math.max(1, Number(e.target.value) || 1))}
              data-testid="inventory-add-qty"
            />
          </label>
          <Button
            className="w-full"
            onClick={() => {
              addInventoryUnit(newDroidId, newTier, newQty)
              const name = droidById.get(newDroidId)?.name ?? newDroidId
              push(t('inventory.added', { name }))
              setAddOpen(false)
              setNewQty(1)
            }}
          >
            {t('inventory.add')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
